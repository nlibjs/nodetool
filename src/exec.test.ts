import ava from 'ava';
import * as process from 'process';
import {exec} from './exec';

ava('exec node -v', async (t) => {
    const result = await exec('node -v');
    t.deepEqual(result, {
        stdout: process.version,
        stderr: '',
    });
});
