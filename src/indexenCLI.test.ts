import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {indexenHeader} from './indexenCLI';
import {exec} from './exec';
const scriptPath = path.join(__dirname, 'indexenCLI.ts');

ava('generate index', async (t) => {
    const baseDirectory = await afs.mkdtemp(path.join(os.tmpdir(), 'indexen'));
    const directory = path.join(baseDirectory, 'test');
    await afs.mkdir(directory);
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.writeFile(path.join(directory, 'a.d.ts'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.js'), '');
    await afs.writeFile(path.join(directory, 'b/b.ts'), '');
    await afs.writeFile(path.join(directory, 'b/c.ts'), '');
    await afs.writeFile(path.join(directory, 'b/d.js'), '');
    await afs.writeFile(path.join(directory, 'b/e.cjs'), '');
    await afs.writeFile(path.join(directory, 'b/f.mjs'), '');
    await afs.writeFile(path.join(directory, 'b/testFoo.ts'), '');
    await afs.writeFile(path.join(directory, 'b/x.test.ts'), '');
    await afs.mkdir(path.join(directory, 'test'));
    await afs.writeFile(path.join(directory, 'test/g.js'), '');
    const output = path.join(directory, 'index.js');
    const expected = [
        indexenHeader,
        'export * from \'./a\';',
        'export * from \'./b/b\';',
        'export * from \'./b/c\';',
        'export * from \'./b/d\';',
        'export * from \'./b/e\';',
        'export * from \'./b/f\';',
        'export * from \'./b/testFoo\';',
        '',
    ].join('\n');
    await exec(`npx ts-node ${scriptPath} --input ${directory} --output ${output}`);
    t.is(await afs.readFile(output, 'utf8'), expected);
    await exec(`npx ts-node ${scriptPath} -i ${directory} -o ${output}`);
    t.is(await afs.readFile(output, 'utf8'), expected);
});

ava('specify ext and exclude', async (t) => {
    const baseDirectory = await afs.mkdtemp(path.join(os.tmpdir(), 'indexen'));
    const directory = path.join(baseDirectory, 'test');
    await afs.mkdir(directory);
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.writeFile(path.join(directory, 'a.d.ts'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.js'), '');
    await afs.writeFile(path.join(directory, 'b/b.ts'), '');
    await afs.writeFile(path.join(directory, 'b/c.ts'), '');
    await afs.writeFile(path.join(directory, 'b/d.js'), '');
    await afs.writeFile(path.join(directory, 'b/e.cjs'), '');
    await afs.writeFile(path.join(directory, 'b/f.mjs'), '');
    await afs.writeFile(path.join(directory, 'b/testFoo.ts'), '');
    await afs.writeFile(path.join(directory, 'b/x.test.ts'), '');
    await afs.mkdir(path.join(directory, 'test'));
    await afs.writeFile(path.join(directory, 'test/g.js'), '');
    const output = path.join(directory, 'index.js');
    const expected = [
        indexenHeader,
        'export * from \'./b/b\';',
        'export * from \'./b/d\';',
        'export * from \'./b/e\';',
        'export * from \'./test/g\';',
        '',
    ].join('\n');
    await exec([
        `npx ts-node ${scriptPath}`,
        '--input',
        directory,
        '--output',
        output,
        '--ext',
        'js',
        '--ext',
        'cjs',
        '--exclude',
        'a.js',
    ].join(' '));
    t.is(await afs.readFile(output, 'utf8'), expected);
});

ava('show help', async (t) => {
    const {stdout: help1} = await exec(`npx ts-node ${scriptPath} --help`);
    const {stdout: help2} = await exec(`npx ts-node ${scriptPath} -h`);
    for (const keyword of ['--input', '-i', '--output', '-o', '--ext', '--help', '-h', '--version', '-v']) {
        t.true(help1.includes(keyword));
        t.true(help2.includes(keyword));
    }
});

ava('output the version number', async (t) => {
    const {stdout: version1} = await exec(`npx ts-node ${scriptPath} --version`);
    const {stdout: version2} = await exec(`npx ts-node ${scriptPath} -v`);
    t.true((/\d+\.\d+\.\d+/).test(version1.trim()));
    t.true((/\d+\.\d+\.\d+/).test(version2.trim()));
});
