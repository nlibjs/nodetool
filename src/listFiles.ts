import * as path from 'path';
import {promises as afs} from 'fs';
import {dictionaryAsc} from './sort';

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

export const getFileList = async (
    directory: string,
    order = dictionaryAsc,
): Promise<Array<string>> => {
    const list: Array<string> = [];
    for await (const file of listFiles(directory)) {
        list.push(file);
    }
    return list.sort(order);
};
