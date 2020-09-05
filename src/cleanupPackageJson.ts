import * as fs from 'fs';

/**
 * https://docs.npmjs.com/configuring-npm/package-json.html
 */
export const npmDocumentedFields = [
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
export const nodejsDocumentedFields = [
    'type',
    'imports',
    'exports',
];

export const unnecessaryFields = [
    'scripts',
    'devDependencies',
];

export const isPackageJSONRequiredKey = (
    key: string,
): boolean => {
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

export const cleanupPackageJSON = <T extends Record<string, unknown>>(
    packageJSON: T,
): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of Object.keys(packageJSON) as Array<keyof T>) {
        if (isPackageJSONRequiredKey(key as string)) {
            result[key] = packageJSON[key];
        }
    }
    return result;
};

export const cleanupPackageJSONFile = async (
    packageJSONPath: string,
    indent = 4,
) => {
    await fs.promises.writeFile(
        packageJSONPath,
        JSON.stringify(
            cleanupPackageJSON(
                JSON.parse(
                    await fs.promises.readFile(packageJSONPath, 'utf8'),
                ) as Record<string, unknown>,
            ),
            null,
            indent,
        ),
    );
};
