import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {resolveImportsCLI} from './resolve-imports-cli';

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
    ].join('\n'));
    await resolveImportsCLI(['--directory', directory]);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'import * as a from \'./a.js\';',
            'import * as b from \'./b/index.js\';',
            'import * as c from \'./b/c.js\';',
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
    ].join('\n'));
    await resolveImportsCLI(['--directory', directory]);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'export * from \'./a.js\';',
            'export * from \'./b/index.js\';',
            'export * from \'./b/c.js\';',
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
    ].join('\n'));
    await resolveImportsCLI(['--directory', directory]);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'const a = import(\'./a.js\');',
            'const b = import(\'./b/index.js\');',
            'const c = import(\'./b/c.js\');',
        ].join('\n'),
    );
});
