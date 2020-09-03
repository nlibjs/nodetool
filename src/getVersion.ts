import * as fs from 'fs';

export const getVersion = (
    jsonPath: string,
): string => (JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as {version: string}).version;
