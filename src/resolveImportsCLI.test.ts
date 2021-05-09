import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {exec} from './exec';
const scriptPath = path.join(__dirname, 'resolveImportsCLI.ts');

ava('resolve static imports', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'resolve-imports'));
    await afs.writeFile(path.join(directory, 'a.js'), '1');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/index.js'), '1');
    await afs.writeFile(path.join(directory, 'b/c.js'), '1');
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, [
        'import * as a from \'./a\';',
        'import * as b from \'./b\';',
        'import * as c from \'./b/c.js\';',
        'import * as d from \'d\';',
    ].join('\n'));
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*.js'`);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'import * as a from \'./a.js\';',
            'import * as b from \'./b/index.js\';',
            'import * as c from \'./b/c.js\';',
            'import * as d from \'d\';',
        ].join('\n'),
    );
});

ava('resolve static exports', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'resolve-imports'));
    await afs.writeFile(path.join(directory, 'a.js'), '1');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/index.js'), '1');
    await afs.writeFile(path.join(directory, 'b/c.js'), '1');
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, [
        'export * from \'./a\';',
        'export * from \'./b\';',
        'export * from \'./b/c.js\';',
        'export * from \'d\';',
    ].join('\n'));
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*.js'`);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'export * from \'./a.js\';',
            'export * from \'./b/index.js\';',
            'export * from \'./b/c.js\';',
            'export * from \'d\';',
        ].join('\n'),
    );
});

ava('resolve dynamic imports', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'resolve-imports'));
    await afs.writeFile(path.join(directory, 'a.js'), '1');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/index.js'), '1');
    await afs.writeFile(path.join(directory, 'b/c.js'), '1');
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, [
        'const a = import(\'./a\');',
        'const b = import(\'./b\');',
        'const c = import(\'./b/c.js\');',
        'const d = import(\'d\');',
    ].join('\n'));
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*.js'`);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'const a = import(\'./a.js\');',
            'const b = import(\'./b/index.js\');',
            'const c = import(\'./b/c.js\');',
            'const d = import(\'d\');',
        ].join('\n'),
    );
});

ava('resolve require', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'resolve-imports'));
    await afs.writeFile(path.join(directory, 'a.js'), '1');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/index.js'), '1');
    await afs.writeFile(path.join(directory, 'b/c.js'), '1');
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, [
        'const a = require(\'./a\');',
        'const b = require(\'./b\');',
        'const c = require(\'./b/c.js\');',
        'const d = require(\'d\');',
    ].join('\n'));
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*.js' --cjs`);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'const a = require(\'./a.js\');',
            'const b = require(\'./b/index.js\');',
            'const c = require(\'./b/c.js\');',
            'const d = require(\'d\');',
        ].join('\n'),
    );
});
