import * as fs from 'fs';
import {isErrorLike} from './is';

export const statOrNull = async (
    filePath: string,
): Promise<fs.Stats | null> => {
    try {
        return await fs.promises.stat(filePath);
    } catch (error: unknown) {
        if (isErrorLike(error) && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
};
