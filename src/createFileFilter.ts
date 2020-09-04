#!/usr/bin/env node
import * as path from 'path';
import {isMatch} from 'picomatch';

export interface FileFilter {
    (file: string): boolean,
}

export const extendPatterns = (...patterns: Array<string>): Array<string> => patterns
.map((pattern) => pattern.includes('/') ? pattern : `**/${pattern}`);

export const createFileFilter = (
    {
        ext: extensions = [],
        include = [],
        exclude = [],
    }: {
        ext?: Array<string>,
        include?: Array<string>,
        exclude?: Array<string>,
    },
): FileFilter => {
    const includePattern = extendPatterns(...extensions.map((ext) => `*${ext}`), ...include);
    const excludePattern = extendPatterns(...exclude);
    return (file) => {
        const normalized = file.split(path.sep).join('/');
        return isMatch(normalized, includePattern) && !isMatch(normalized, excludePattern);
    };
};
