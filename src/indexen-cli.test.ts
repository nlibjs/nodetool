import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as stream from 'stream';
import ava from 'ava';
import {indexenCLI, indexenHeader} from './indexen-cli';

ava('generate index', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'indexen'));
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.js'), '');
    await afs.writeFile(path.join(directory, 'b/c.js'), '');
    const output = path.join(directory, 'index.js');
    const expected = new Set([
        indexenHeader,
        'export * from \'./a\';',
        'export * from \'./b/c\';',
        'export * from \'./b/b\';',
        '',
    ]);
    await indexenCLI(['--input', directory, '--output', output]);
    const index1 = await afs.readFile(output, 'utf8');
    t.deepEqual(new Set(index1.split('\n')), expected);
    await indexenCLI(['-i', directory, '-o', output]);
    const index2 = await afs.readFile(output, 'utf8');
    t.deepEqual(new Set(index2.split('\n')), expected);
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
    for (const keyword of ['--input', '-i', '--output', '-o', '--help', '-h', '--version', '-v']) {
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
