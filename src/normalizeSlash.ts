import * as path from 'path';

export const normalizeSlash = (
    filePath: string,
): string => filePath.split(path.sep).join('/');
