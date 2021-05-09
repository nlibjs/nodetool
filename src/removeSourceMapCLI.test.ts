import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {exec} from './exec';
const scriptPath = path.join(__dirname, 'removeSourceMapCLI.ts');

ava('remove sourcemap lines', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'findSourceMap'));
    const dir1 = path.join(directory, 'dir1');
    await afs.mkdir(dir1);
    const dir2 = path.join(directory, 'dir2');
    await afs.mkdir(dir2);
    const sourceFile1 = path.join(dir1, 'input.js');
    await afs.writeFile(sourceFile1, [
        'foo1',
        '//# sourceMappingURL=foo.js.map',
        'bar1',
    ].join('\n'));
    const sourceFile2 = path.join(dir2, 'input.js');
    await afs.writeFile(sourceFile2, [
        'foo2',
        '//# sourceMappingURL=foo.js.map',
        'bar2',
    ].join('\n'));
    await exec(`npx ts-node ${scriptPath} --include '${dir1}/**/*.js' --include '${dir2}/**/*.js'`);
    t.is(
        await afs.readFile(sourceFile1, 'utf8'),
        [
            'foo1',
            'bar1',
        ].join('\n'),
    );
    t.is(
        await afs.readFile(sourceFile2, 'utf8'),
        [
            'foo2',
            'bar2',
        ].join('\n'),
    );
});
