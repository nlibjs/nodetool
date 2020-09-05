import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {replaceExtCLI} from './replace-ext-cli';
import {getFileList} from './listFiles';

ava('replace the extensions', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'replaceExt'));
    await afs.writeFile(path.join(directory, 'a.js'), '');
    await afs.writeFile(path.join(directory, 'a.d.ts'), '');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.js'), '');
    await afs.writeFile(path.join(directory, 'b/c.ts'), '');
    await afs.writeFile(path.join(directory, 'b/d.js'), '');
    await afs.writeFile(path.join(directory, 'b/e.cjs'), '');
    await afs.writeFile(path.join(directory, 'b/f.mjs'), '');
    await replaceExtCLI(['--directory', directory, '--entry', 'ts/txt', '-e', 'cjs/log']);
    t.deepEqual(
        (await getFileList(directory)).map((file) => path.relative(directory, file)),
        [
            'a.d.txt',
            'a.js',
            'b/b.js',
            'b/c.txt',
            'b/d.js',
            'b/e.log',
            'b/f.mjs',
        ],
    );
});
