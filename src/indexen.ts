import * as path from 'path';
import {listFiles} from './listFiles';

export const indexen = async function* (
    {directory, include, quote = '\''}: {
        directory: string,
        include: (file: string) => boolean,
        quote?: '\'' | '"' | '`',
    },
): AsyncGenerator<string> {
    for await (const file of listFiles(directory)) {
        if (include(file)) {
            yield `export * from ${quote}./`;
            yield path.relative(directory, file).slice(0, -path.extname(file).length);
            yield `${quote};\n`;
        }
    }
};
