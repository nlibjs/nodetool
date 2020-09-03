import * as path from 'path';
import {listFiles} from './listFiles';

export const indexen = async function* (
    {directory, include}: {
        directory: string,
        include: (file: string) => boolean,
    },
): AsyncGenerator<string> {
    for await (const file of listFiles(directory)) {
        if (include(file)) {
            yield `export * from './`;
            yield path.relative(directory, file).slice(0, -path.extname(file).length);
            yield '\';\n';
        }
    }
    yield '\n';
};
