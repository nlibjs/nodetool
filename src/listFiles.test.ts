import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {listFiles} from './listFiles';

ava('list files', async (t) => {
    const results: {[key: string]: true} = {};
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'list-files'));
    await afs.writeFile(path.join(directory, 'a.txt'), 'a');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.txt'), 'b');
    await afs.writeFile(path.join(directory, 'c.txt'), 'c');
    for await (const file of listFiles(directory)) {
        results[file] = true;
    }
    t.deepEqual(results, {
        [path.join(directory, 'a.txt')]: true,
        [path.join(directory, 'b/b.txt')]: true,
        [path.join(directory, 'c.txt')]: true,
    });
});
