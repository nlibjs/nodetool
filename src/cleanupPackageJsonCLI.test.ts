import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {cleanupPackageJsonCLI} from './cleanupPackageJsonCLI';

ava('cleanup package.json', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'cleanup-package-json'));
    const packageJsonPath = path.join(directory, 'a.json');
    await afs.writeFile(packageJsonPath, JSON.stringify({
        name: 'foo',
        exports: 'bar',
        ava: '',
        eslintConfig: '',
        commitlint: '',
        husky: '',
    }, null, 4));
    await cleanupPackageJsonCLI(['--file', packageJsonPath]);
    t.is(
        await afs.readFile(packageJsonPath, 'utf8'),
        JSON.stringify({
            name: 'foo',
            exports: 'bar',
        }, null, 4),
    );
});
