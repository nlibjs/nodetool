import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {getVersion} from './getVersion';

ava('get the version number', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'get-version'));
    const jsonPath = path.join(directory, 'test.json');
    await afs.writeFile(jsonPath, '{"version": "foo"}');
    t.is(getVersion(jsonPath), 'foo');
});
