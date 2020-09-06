import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {
    resolveModule,
    RequireJSFirst,
    RequireMJSFirst,
    RequireCJSFirst,
} from './resolveModule';

ava('resolve a module id', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'resolveModule'));
    const js = path.join(directory, 'a.js');
    const mjs = path.join(directory, 'a.mjs');
    const cjs = path.join(directory, 'a.cjs');
    await afs.writeFile(js, '');
    await afs.writeFile(mjs, '');
    await afs.writeFile(cjs, '');
    const id = path.join(directory, 'a');
    t.is(await resolveModule(id, RequireJSFirst), js);
    t.is(await resolveModule(id, RequireMJSFirst), mjs);
    t.is(await resolveModule(id, RequireCJSFirst), cjs);
    t.is(await resolveModule(`${id}.cjs`, []), cjs);
    await t.throwsAsync(async () => await resolveModule(id, []), {message: /^Unresolvable/});
});

ava('resolve a module id (directory)', async (t) => {
    const baseDirectory = await afs.mkdtemp(path.join(os.tmpdir(), 'resolveModule'));
    const directory = path.join(baseDirectory, 'a');
    await afs.mkdir(directory);
    const js = path.join(directory, 'index.js');
    const mjs = path.join(directory, 'index.mjs');
    const cjs = path.join(directory, 'index.cjs');
    await afs.writeFile(js, '');
    await afs.writeFile(mjs, '');
    await afs.writeFile(cjs, '');
    const id = path.join(baseDirectory, 'a');
    t.is(await resolveModule(id, RequireJSFirst), js);
    t.is(await resolveModule(id, RequireMJSFirst), mjs);
    t.is(await resolveModule(id, RequireCJSFirst), cjs);
});
