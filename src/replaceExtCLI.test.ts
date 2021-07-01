import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as fg from 'fast-glob';
import ava from 'ava';
import {normalizeSlash} from './normalizeSlash';
import type {RawSourceMap} from 'source-map';
import {exec} from './exec';
import {dictionaryAsc} from './sort';
const scriptPath = path.join(__dirname, 'replaceExtCLI.ts');

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
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*' --entry ts/txt -e cjs/log`);
    t.deepEqual(
        (await fg(`${directory}/**/*`))
        .sort(dictionaryAsc)
        .map((file) => normalizeSlash(path.relative(directory, file))),
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

ava('update sourcemap', async (t) => {
    const sourceMapData = {
        version: 3,
        file: 'a.js',
        sources: [
            '../src/a.js',
        ],
        names: [],
        mappings: 'AAAA,OAAO,EAAC',
    };
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'replaceExt'));
    await afs.writeFile(
        path.join(directory, 'a.js'),
        [
            '',
            '//# sourceMappingURL=a.js.map',
        ].join('\n'),
    );
    await afs.writeFile(
        path.join(directory, 'a.js.map'),
        JSON.stringify(sourceMapData, null, 4),
    );
    await exec(`npx ts-node ${scriptPath} --include '${directory}/**/*' --entry js/cjs`);
    t.deepEqual(
        (await fg(`${directory}/**/*`))
        .sort(dictionaryAsc)
        .map((file) => normalizeSlash(path.relative(directory, file))),
        [
            'a.cjs',
            'a.js.map',
        ],
    );
    const updated = JSON.parse(
        await afs.readFile(path.join(directory, 'a.js.map'), 'utf8'),
    ) as unknown as RawSourceMap;
    t.deepEqual(
        updated,
        {
            version: 3,
            file: 'a.cjs',
            sources: [
                '../src/a.js',
            ],
            names: [],
            mappings: 'AAAA,OAAO,EAAC',
        },
    );
});
