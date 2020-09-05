import * as path from 'path';
import {getFileList} from './listFiles';
import {normalizeSlash} from './normalizeSlash';
import {CompareFunction} from './sort';

export const indexen = async function* (
    {
        directory,
        include,
        quote = '\'',
        order,
    }: {
        directory: string,
        include: (file: string) => boolean,
        quote?: '\'' | '"' | '`',
        order?: CompareFunction<string>,
    },
): AsyncGenerator<string> {
    for (const file of await getFileList(directory, order)) {
        if (include(file)) {
            yield `export * from ${quote}./`;
            yield normalizeSlash(path.relative(directory, file)).slice(0, -path.extname(file).length);
            yield `${quote};\n`;
        }
    }
};
