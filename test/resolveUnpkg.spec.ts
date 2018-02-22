import {expect} from 'chai';
import * as mock from 'mock-fs';
import {resolveUnpkgFromFS} from '../src/resolveUnpkgFromFS';
import * as fs from 'fs';

describe('FindCurrentVersion', () => {
  const file1Name = 'file1';
  const file1Contents = 'fileContents';

  const package1Name = 'package1';

  const package1Version = '1.0.0';
  const parent = '@nested';
  const package2Name = 'package2';
  const package2Version = '1.0.1';

  const file2Name = 'file2';
  const file2Contents = `unpkg/${package1Name}@{version}`;
  const file2Version = '1.0.5';

  const file3Name = 'file3';
  const file3Contents = `unpkg/${package1Name}@{version}`;
  const file3Version = 'x.x.x';

  const file4Name = 'file4';
  const file4Contents = `unpkg/${package1Name}@{version}`;
  const file4Version = 'x.y.z';

  const file5Name = 'file5';
  const file5Contents = `unpkg/${package1Name}@{version}\nunpkg/${package1Name}@1.2.3`;
  const file5Version = 'x.y.z';

  beforeEach(() => {
    mock({
      node_modules: {
        [package1Name]: {
          'package.json': JSON.stringify({version: package1Version})
        },
        [parent]: {
          [package2Name]: {
            'package.json': JSON.stringify({version: package2Version})
          }
        }
      },
      [file1Name]: file1Contents,
      [file2Name]: file2Contents.replace('{version}', file2Version),
      [file3Name]: file3Contents.replace('{version}', file3Version),
      [file4Name]: file3Contents.replace('{version}', file4Version),
      [file5Name]: file5Contents.replace('{version}', file5Version)
    });
  });

  it('should not change a file without unpkg', () => {
    resolveUnpkgFromFS({file: file1Name, unpkgPrefix: 'unpkg'});

    const result = fs.readFileSync(file1Name, 'utf-8');
    expect(result).to.equal(file1Contents);
  });

  it('should support file replacment (without dist)', () => {
    resolveUnpkgFromFS({file: file2Name, unpkgPrefix: 'unpkg'});

    const result = fs.readFileSync(file2Name, 'utf-8');
    expect(result).to.equal(file2Contents.replace('{version}', package1Version));
  });

  it('should create file in dist', () => {
    const dist = 'a/b/c/a.json';
    resolveUnpkgFromFS({file: file2Name, unpkgPrefix: 'unpkg', dist});

    const result = fs.readFileSync(dist, 'utf-8');
    expect(result).to.equal(file2Contents.replace('{version}', package1Version));
  });

  it('should create file in dist when given', () => {
    const dist = 'a/b/c/a.json';
    resolveUnpkgFromFS({file: file2Name, unpkgPrefix: 'unpkg', dist});

    const result = fs.readFileSync(dist, 'utf-8');
    expect(result).to.equal(file2Contents.replace('{version}', package1Version));
  });

  it('should handle x.x.x version', () => {
    resolveUnpkgFromFS({file: file3Name, unpkgPrefix: 'unpkg'});

    const result = fs.readFileSync(file3Name, 'utf-8');
    expect(result).to.equal(file3Contents.replace('{version}', package1Version));
  });

  it('should handle custom (x.y.z) version', () => {
    resolveUnpkgFromFS({file: file4Name, unpkgPrefix: 'unpkg', versionPlaceholder: file4Version});

    const result = fs.readFileSync(file4Name, 'utf-8');
    expect(result).to.equal(file4Contents.replace('{version}', package1Version));
  });

  it('should only fix by version placeholder', () => {
    resolveUnpkgFromFS({
      file: file5Name,
      unpkgPrefix: 'unpkg',
      versionPlaceholder: file5Version,
      onlyByVersionPlaceholder: true
    });

    const result = fs.readFileSync(file5Name, 'utf-8');
    expect(result).to.equal(file5Contents.replace('{version}', package1Version));
  });
});
