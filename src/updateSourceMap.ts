import * as fs from 'fs';
import * as path from 'path';
import MagicString from 'magic-string';
import {RawSourceMap} from 'source-map';
import {findSourceMapFileFromUrl, FoundSourceMap} from './findSourceMap';
import {normalizeSlash} from './normalizeSlash';
import {mergeSourceMaps} from './mergeSourceMap';

export const updateSourceMap = async (
    {
        sourceMap: {file, code, url, line},
        newData,
    }: {
        sourceMap: FoundSourceMap,
        newData: RawSourceMap,
    },
): Promise<void> => {
    const sourceMapFile = findSourceMapFileFromUrl({
        file,
        url: code.slice(url.start, url.end),
    }) || `${file}.map`;
    const s = new MagicString(code);
    s.remove(line.start, line.end);
    s.append(`//# sourceMappingURL=${normalizeSlash(path.relative(path.dirname(file), sourceMapFile))}\n`);
    const source = path.basename(newData.file);
    await Promise.all([
        fs.promises.writeFile(sourceMapFile, JSON.stringify(
            {
                ...await mergeSourceMaps(
                    newData,
                    s.generateMap({source, file: source}),
                ),
            },
            null,
            4,
        )),
        fs.promises.writeFile(file, s.toString()),
    ]);
};
