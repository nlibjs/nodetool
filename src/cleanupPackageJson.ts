import * as fs from 'fs';

/**
 * https://docs.npmjs.com/configuring-npm/package-json.html
 */
const npmDocumentedFields = [
    'name',
    'version',
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'contributors',
    'funding',
    'files',
    'main',
    'browser',
    'bin',
    'man',
    'directories',
    'repository',
    'scripts',
    'config',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'bundledDependencies',
    'optionalDependencies',
    'engines',
    'engineStrict',
    'os',
    'cpu',
    'preferGlobal',
    'private',
    'publishConfig',
];

/**
 * https://nodejs.org/api/modules.html
 * https://nodejs.org/api/esm.html
 */
const nodejsDocumentedFields = [
    'type',
    'imports',
    'exports',
];

const unnecessaryFields = [
    'scripts',
    'devDependencies',
];

const isPackageJSONRequiredKey = (
    key: string,
    keep: Array<string>,
): boolean => {
    if (keep.includes(key)) {
        return true;
    }
    if (unnecessaryFields.includes(key)) {
        return false;
    }
    if (npmDocumentedFields.includes(key)) {
        return true;
    }
    if (nodejsDocumentedFields.includes(key)) {
        return true;
    }
    return false;
};

interface CleanupPackageJSONOptions {
    keep?: Array<string>,
}

const cleanupPackageJSON = <T extends Record<string, unknown>>(
    packageJSON: T,
    {keep = []}: CleanupPackageJSONOptions = {},
): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of Object.keys(packageJSON) as Array<keyof T>) {
        if (isPackageJSONRequiredKey(key as string, keep)) {
            result[key] = packageJSON[key];
        }
    }
    return result;
};

interface CleanupPackageJSONFileOptions extends CleanupPackageJSONOptions {
    indent?: number,
}

export const cleanupPackageJSONFile = async (
    packageJSONPath: string,
    {indent = 4, ...options}: CleanupPackageJSONFileOptions = {},
) => {
    await fs.promises.writeFile(
        packageJSONPath,
        JSON.stringify(
            cleanupPackageJSON(
                JSON.parse(await fs.promises.readFile(packageJSONPath, 'utf8')) as Record<string, unknown>,
                options,
            ),
            null,
            indent,
        ),
    );
};
