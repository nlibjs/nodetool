import * as path from 'path';
import {getFileList} from './listFiles';
import {normalizeSlash} from './normalizeSlash';
import type {CompareFunction} from './sort';

export const indexen = async function* (
    {
        directory,
        include,
        quote = '\'',
        order,
    }: {
        directory: string,
        include: (file: string) => boolean,
        quote?: '"' | '\'' | '`',
        order?: CompareFunction<string>,
    },
): AsyncGenerator<string> {
    const history: Array<string> = [];
    for (const file of await getFileList(directory, order)) {
        if (include(file)) {
            const id = normalizeSlash(path.relative(directory, file)).slice(0, -path.extname(file).length);
            if (!history.includes(id)) {
                history.push(id);
                yield `export * from ${quote}./${id}${quote};\n`;
            }
        }
    }
};
