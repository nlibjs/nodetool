import * as path from 'path';
import {promises as afs} from 'fs';

export const listFiles = async function* (
    directory: string,
): AsyncGenerator<string> {
    for await (const dirent of await afs.opendir(directory)) {
        const file = path.join(directory, dirent.name);
        if (dirent.isDirectory()) {
            yield* listFiles(file);
        } else {
            yield file;
        }
    }
};
