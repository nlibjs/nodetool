import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {indexenHeader} from './indexenCLI';
import {exec} from './exec';
const scriptPath = path.join(__dirname, 'indexenCLI.ts');
const prepareFiles = async () => {
    const baseDirectory = await afs.mkdtemp(path.join(os.tmpdir(), 'indexen'));
    const directory = path.join(baseDirectory, 'test');
    await afs.mkdir(directory);
    await afs.writeFile(path.join(directory, 'index.ts'), '');
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.writeFile(path.join(directory, 'a.d.ts'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/index.js'), '');
    await afs.writeFile(path.join(directory, 'b/b.ts'), '');
    await afs.writeFile(path.join(directory, 'b/c.ts'), '');
    await afs.writeFile(path.join(directory, 'b/d.js'), '');
    await afs.writeFile(path.join(directory, 'b/e.cjs'), '');
    await afs.writeFile(path.join(directory, 'b/f.mjs'), '');
    await afs.writeFile(path.join(directory, 'b/testFoo.ts'), '');
    await afs.writeFile(path.join(directory, 'b/x.test.ts'), '');
    await afs.mkdir(path.join(directory, 'test'));
    await afs.writeFile(path.join(directory, 'test/g.js'), '');
    return {baseDirectory, directory};
};

ava('generate index', async (t) => {
    const {directory} = await prepareFiles();
    const output = path.join(directory, 'output.js');
    const expected = [
        indexenHeader,
        'export * from \'.\';',
        'export * from \'./a\';',
        'export * from \'./b\';',
        'export * from \'./b/b\';',
        'export * from \'./b/c\';',
        'export * from \'./b/d\';',
        'export * from \'./b/e\';',
        'export * from \'./b/f\';',
        'export * from \'./b/testFoo\';',
        'export * from \'./b/x.test\';',
        'export * from \'./test/g\';',
        '',
    ].join('\n');
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*' --output ${output}`);
    t.is(await afs.readFile(output, 'utf8'), expected);
});

ava('use exclude', async (t) => {
    const {directory} = await prepareFiles();
    const output = path.join(directory, 'output.js');
    const expected = [
        indexenHeader,
        'export * from \'.\';',
        'export * from \'./a\';',
        'export * from \'./b\';',
        'export * from \'./b/b\';',
        'export * from \'./b/c\';',
        'export * from \'./b/d\';',
        'export * from \'./b/f\';',
        'export * from \'./b/testFoo\';',
        'export * from \'./test/g\';',
        '',
    ].join('\n');
    await exec([
        `npx ts-node ${scriptPath}`,
        `--include '${directory}/**/*'`,
        '--exclude \'**/*.cjs\'',
        '--exclude \'**/*.test.*\'',
        `--output ${output}`,
    ].join(' '));
    t.is(await afs.readFile(output, 'utf8'), expected);
});

ava('use exclude and ext', async (t) => {
    const {directory} = await prepareFiles();
    const output = path.join(directory, 'output.js');
    const expected = [
        indexenHeader,
        'export * from \'./a.js\';',
        'export * from \'./b/b.ts\';',
        'export * from \'./b/c.ts\';',
        'export * from \'./b/d.js\';',
        'export * from \'./b/f.mjs\';',
        'export * from \'./b/index.js\';',
        'export * from \'./b/testFoo.ts\';',
        'export * from \'./index.ts\';',
        'export * from \'./test/g.js\';',
        '',
    ].join('\n');
    await exec([
        `npx ts-node ${scriptPath}`,
        `--include '${directory}/**/*'`,
        '--exclude \'**/*.cjs\'',
        '--exclude \'**/*.test.*\'',
        '--ext',
        `--output ${output}`,
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
