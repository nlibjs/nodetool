import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {listFiles} from './listFiles';

ava('list files', async (t) => {
    const results = new Set<string>();
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'list-files'));
    await afs.writeFile(path.join(directory, 'a.txt'), 'a');
    await afs.mkdir(path.join(directory, 'b'));
    await afs.writeFile(path.join(directory, 'b/b.txt'), 'b');
    await afs.writeFile(path.join(directory, 'c.txt'), 'c');
    for await (const file of listFiles(directory)) {
        results.add(file);
    }
    t.is(results.size, 3);
    t.true(results.has(path.join(directory, 'a.txt')));
    t.true(results.has(path.join(directory, 'b/b.txt')));
    t.true(results.has(path.join(directory, 'c.txt')));
});
