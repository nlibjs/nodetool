import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {exec} from './exec';
const scriptPath = path.join(__dirname, 'cleanupPackageJsonCLI.ts');

ava('cleanup package.json', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'cleanup-package-json'));
    const packageJsonPath = path.join(directory, 'a.json');
    await afs.writeFile(packageJsonPath, JSON.stringify({
        name: 'foo',
        scripts: {},
        exports: 'bar',
        ava: '',
        eslintConfig: '',
        commitlint: '',
    }, null, 4));
    t.log(await exec(`npx ts-node ${scriptPath} --file ${packageJsonPath}`));
    t.is(
        await afs.readFile(packageJsonPath, 'utf8'),
        JSON.stringify({
            name: 'foo',
            scripts: {},
            exports: 'bar',
        }, null, 4),
    );
});

ava('keep some keys', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'cleanup-package-json'));
    const packageJsonPath = path.join(directory, 'a.json');
    await afs.writeFile(packageJsonPath, JSON.stringify({
        name: 'foo',
        exports: 'bar',
        ava: '',
        eslintConfig: '',
        commitlint: '',
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
        key4: 'value4',
    }, null, 4));
    t.log(await exec(`npx ts-node ${scriptPath} --file ${packageJsonPath} --keep key2 --keep key4`));
    t.is(
        await afs.readFile(packageJsonPath, 'utf8'),
        JSON.stringify({
            name: 'foo',
            exports: 'bar',
            key2: 'value2',
            key4: 'value4',
        }, null, 4),
    );
});
