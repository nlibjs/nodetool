import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as stream from 'stream';
import ava from 'ava';
import {indexenCLI, indexenHeader} from './indexen-cli';

ava('generate index', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'indexen'));
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.writeFile(path.join(directory, 'a.d.ts'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.js'), '');
    await afs.writeFile(path.join(directory, 'b/c.ts'), '');
    await afs.writeFile(path.join(directory, 'b/d.js'), '');
    await afs.writeFile(path.join(directory, 'b/e.cjs'), '');
    await afs.writeFile(path.join(directory, 'b/f.mjs'), '');
    const output = path.join(directory, 'index.js');
    const expected = [
        indexenHeader,
        'export * from \'./a\';',
        'export * from \'./b/b\';',
        'export * from \'./b/c\';',
        'export * from \'./b/d\';',
        'export * from \'./b/e\';',
        'export * from \'./b/f\';',
        '',
    ].join('\n');
    await indexenCLI(['--input', directory, '--output', output]);
    t.is(await afs.readFile(output, 'utf8'), expected);
    await indexenCLI(['-i', directory, '-o', output]);
    t.is(await afs.readFile(output, 'utf8'), expected);
});

ava('specify ext and exclude', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'indexen'));
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.writeFile(path.join(directory, 'a.d.ts'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.js'), '');
    await afs.writeFile(path.join(directory, 'b/c.ts'), '');
    await afs.writeFile(path.join(directory, 'b/d.js'), '');
    await afs.writeFile(path.join(directory, 'b/e.cjs'), '');
    await afs.writeFile(path.join(directory, 'b/f.mjs'), '');
    const output = path.join(directory, 'index.js');
    const expected = [
        indexenHeader,
        'export * from \'./b/b\';',
        'export * from \'./b/d\';',
        'export * from \'./b/e\';',
        '',
    ].join('\n');
    await indexenCLI([
        '--input',
        directory,
        '--output',
        output,
        '--ext',
        '*.js',
        '--ext',
        '*.cjs',
        '--exclude',
        'a.js',
    ]);
    t.is(await afs.readFile(output, 'utf8'), expected);
});

ava('show help', async (t) => {
    const chunks1: Array<Buffer> = [];
    await indexenCLI(['--help'], new stream.Writable({
        write(chunk: Buffer, _encoding, callback) {
            chunks1.push(chunk);
            callback();
        },
    }));
    const help1 = `${Buffer.concat(chunks1)}`;
    const chunks2: Array<Buffer> = [];
    await indexenCLI(['--help'], new stream.Writable({
        write(chunk: Buffer, _encoding, callback) {
            chunks2.push(chunk);
            callback();
        },
    }));
    const help2 = `${Buffer.concat(chunks2)}`;
    for (const keyword of ['--input', '-i', '--output', '-o', '--ext', '--help', '-h', '--version', '-v']) {
        t.true(help1.includes(keyword));
        t.true(help2.includes(keyword));
    }
});

ava('output the version number', async (t) => {
    const chunks1: Array<Buffer> = [];
    await indexenCLI(['--version'], new stream.Writable({
        write(chunk: Buffer, _encoding, callback) {
            chunks1.push(chunk);
            callback();
        },
    }));
    const chunks2: Array<Buffer> = [];
    await indexenCLI(['-v'], new stream.Writable({
        write(chunk: Buffer, _encoding, callback) {
            chunks2.push(chunk);
            callback();
        },
    }));
    t.true((/\d+\.\d+\.\d+/).test(`${Buffer.concat(chunks1)}`.trim()));
    t.true((/\d+\.\d+\.\d+/).test(`${Buffer.concat(chunks2)}`.trim()));
});
