import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {exec} from './exec';
const scriptPath = path.join(__dirname, 'removeSourceMapCLI.ts');

ava('remove sourcemap lines', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'findSourceMap'));
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, [
        'foo',
        '//# sourceMappingURL=foo.js.map',
        'bar',
    ].join('\n'));
    await exec(`npx ts-node ${scriptPath} --directory ${directory}`);
    t.is(
        await afs.readFile(sourceFile, 'utf8'),
        [
            'foo',
            'bar',
        ].join('\n'),
    );
});
