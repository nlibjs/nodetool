import {promises as afs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import ava from 'ava';
import {findSourceMap, findSourceMapFileFromUrl} from './findSourceMap';

const sampleSourceMapData = {
    version: 3,
    file: 'input.js',
    sourceRoot: '',
    sources: [
        '../src/input.js',
    ],
    names: [],
    mappings: 'AAAA,OAAO,EAAC',
};

const generateDataURL = (
    {
        data,
        mediaType = 'application/json',
        base64 = true,
    }: {
        data: Buffer,
        mediaType?: string,
        base64?: boolean,
    },
): string => [
    `data:${mediaType}${base64 ? ';base64' : ''}`,
    base64 ? data.toString('base64') : encodeURIComponent(`${data}`),
].join(',');

ava('find sourcemap (null)', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'findSourceMap'));
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, '');
    const actual = await findSourceMap(sourceFile);
    t.deepEqual(actual, null);
});

ava('find sourcemap (url)', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'findSourceMap'));
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, '//# sourceMappingURL=foo.js.map');
    await afs.writeFile(path.join(directory, 'foo.js.map'), JSON.stringify(sampleSourceMapData, null, 4));
    const actual = await findSourceMap(sourceFile);
    t.deepEqual(actual, {
        line: {start: 0, end: 31},
        url: {start: 21, end: 31},
        data: sampleSourceMapData,
    });
    t.is(
        findSourceMapFileFromUrl({url: 'foo.js.map', file: sourceFile}),
        path.join(directory, 'foo.js.map'),
    );
});

ava('find sourcemap (base64 data url)', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'findSourceMap'));
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, `//# sourceMappingURL=${generateDataURL({
        data: Buffer.from(JSON.stringify(sampleSourceMapData, null, 4)),
        base64: true,
    })}`);
    const actual = await findSourceMap(sourceFile);
    t.deepEqual(actual, {
        line: {start: 0, end: 274},
        url: {start: 21, end: 274},
        data: sampleSourceMapData,
    });
});

ava('find sourcemap (encoded data url)', async (t) => {
    const directory = await afs.mkdtemp(path.join(os.tmpdir(), 'findSourceMap'));
    const sourceFile = path.join(directory, 'input.js');
    await afs.writeFile(sourceFile, `//# sourceMappingURL=${generateDataURL({
        data: Buffer.from(JSON.stringify(sampleSourceMapData, null, 4)),
        base64: false,
    })}`);
    const actual = await findSourceMap(sourceFile);
    t.deepEqual(actual, {
        line: {start: 0, end: 394},
        url: {start: 21, end: 394},
        data: sampleSourceMapData,
    });
});
