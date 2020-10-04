# Changelog

## v0.1.11 (2020-10-04)

### Dependency Upgrades

- add @types/node (a89efaf)
- setup @nlib/lint-commit (0878c20)


## v0.1.10 (2020-09-16)

### Bug Fixes

- use require.main === module (de6df57)

### Tests

- set timeout (0594f1c)
- execute command directly (c939824)


## v0.1.9 (2020-09-15)

### Code Refactoring

- replace module.parent to require.main (874c815)

### Dependency Upgrades

- upgrade dependencies (09f522f)


## v0.1.8 (2020-09-06)

### Features

- update sourcemap on replaceExt (4d5f772)


## v0.1.7 (2020-09-06)

### Features

- removeSourceMapCLI (f7cc173)
- add getLineRange (fd34073)
- fix sourcemap (485d2db)
- add findSourceMapFileFromUrl (386b76b)
- output line and url information (160891c)
- add findSourceMap (075d8b7)

### Bug Fixes

- condition (1dcfdf2)

### Code Refactoring

- move statOrNull (ebfe712)


## v0.1.6 (2020-09-06)

### Features

- add the --cjs flag (59e7c39)


## v0.1.5 (2020-09-06)

### Features

- add resolveModule (e25946f)
- add isErrorLike (372e812)

### Bug Fixes

- use path.sep (58a6c7d)
- use resolveModule in resolveImports (7e37d28)

### Build System

- generate index (c351bab)


## v0.1.4 (2020-09-05)

### Bug Fixes

- skip non-relative imports (6ca782d)


## v0.1.3 (2020-09-05)

### Continuous Integration

- fix arguments (4b8eedb)


## v0.1.2 (2020-09-05)

### Continuous Integration

- fix typo (d2aeb16)


## v0.1.1 (2020-09-05)

### Continuous Integration

- run cleanupPackageJSONCLI before publish (24b986e)


## v0.1.0 (2020-09-05)

### Features

- add cleanup-package-json (384448b)

### Bug Fixes

- typo (71411ce)

### Tests

- test type (9a32381)

### Styles

- rename resolveImportsCLI (5d412bd)
- rename replace-ext-cli (436ca8f)
- rename indexen-cli (743ab64)


## v0.0.6 (2020-09-05)


## v0.0.5 (2020-09-05)


## v0.0.4 (2020-09-05)

### Tests

- normalizeSlash (b685117)


## v0.0.3 (2020-09-05)

### Breaking Changes

- --ext shouldn't be dot-prefixed (b51d5d5)

### Features

- add replace-ext (ba06217)


## v0.0.2 (2020-09-05)

### Features

- sort indexen output (e3ffc1b)


## v0.0.1 (2020-09-04)

### Features

- add normalizeSlash (ed321dd)
- add resolve-imports (c58381c)
- add createFileFilter (0790d1b)
- createFileFilter (0155e4f)
- accept exec options (a8b1ead)
- add exec (a69d002)
- add indexen CLI (2f98f96)
- add indexen (5a6537f)
- add listFiles (be1bece)
- add parseCLIArguments (cc2a223)

### Bug Fixes

- use normalizeSlash (b5e1e98)
- use normalizeSlash (905e009)
- use createFileFilter (163cbed)
- add the default value (7ccbc88)

### Tests

- indexen-cli (1fe789d)
- getVersion (b2a2e89)

### Continuous Integration

- set git to use LF (54619bd)
- add windows and macos (3b6cc6b)


