import * as path from 'path';

export interface FileFilter {
    (file: string): boolean,
}

export const createFileFilter = (
    {
        extensions,
    }: {
        extensions?: Array<string>,
    } = {},
): FileFilter => (
    file: string,
): boolean => {
    if (!file) {
        return false;
    }
    if (extensions && !extensions.includes(path.extname(file))) {
        return false;
    }
    return true;
};
