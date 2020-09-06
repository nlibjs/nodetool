import * as path from 'path';
import {statOrNull} from './statOrNull';

export const RequireCJSFirst = ['cjs', 'js', 'mjs'];
export const RequireMJSFirst = ['mjs', 'js', 'cjs'];
export const RequireJSFirst = ['js', 'mjs', 'cjs'];

export const resolveModule = async (
    id: string,
    extensions: Array<string> = RequireJSFirst,
    resolveDirectory = true,
): Promise<string> => {
    const stats = await statOrNull(id);
    if (stats) {
        if (stats.isFile()) {
            return id;
        } else if (resolveDirectory && stats.isDirectory()) {
            return await resolveModule(`${id}${path.sep}index`, extensions, false);
        }
    }
    for (const extension of extensions) {
        const candidate = `${id}.${extension}`;
        const candidateStats = await statOrNull(candidate);
        if (candidateStats && candidateStats.isFile()) {
            return candidate;
        }
    }
    throw new Error(`Unresolvable: ${id}`);
};
