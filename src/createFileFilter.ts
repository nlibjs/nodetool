#!/usr/bin/env node
import {isMatch} from 'picomatch';
import {normalizeSlash} from './normalizeSlash';

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
        const normalized = normalizeSlash(file);
        return isMatch(normalized, includePattern) && !isMatch(normalized, excludePattern);
    };
};
