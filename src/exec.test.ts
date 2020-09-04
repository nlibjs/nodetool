import ava from 'ava';
import * as path from 'path';
import * as process from 'process';
import {exec} from './exec';

ava('exec node -v', async (t) => {
    const result = await exec('node -v');
    t.deepEqual(result, {
        stdout: process.version,
        stderr: '',
    });
});

ava('exec node -p "process.cwd()"', async (t) => {
    const cwd = path.resolve(__dirname);
    const result = await exec(
        'node -p "process.cwd()"',
        {cwd},
    );
    t.deepEqual(result, {
        stdout: cwd,
        stderr: '',
    });
});
