import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import MagicString from 'magic-string';
import {listFiles} from './listFiles';
import {normalizeSlash} from './normalizeSlash';
import {resolveModule} from './resolveModule';

interface Literal extends acorn.Node {
    raw: string,
    value: string | boolean | null | number | RegExp,
}

interface NodeWithSource extends acorn.Node {
    source: Literal,
}

export const resolveImport = async (
    importee: string,
    directory: string,
    extensions?: Array<string>,
): Promise<string> => {
    if (!importee.startsWith('.')) {
        return importee;
    }
    const realPathDirectory = await fs.promises.realpath(directory);
    let relative = normalizeSlash(path.relative(
        realPathDirectory,
        await resolveModule(
            path.join(realPathDirectory, importee),
            extensions,
        ),
    ));
    if (!relative.startsWith('.')) {
        relative = `./${relative}`;
    }
    return relative;
};

export const resolveImports = async (
    sourceFile: string,
    code: string,
    {extensions, acorn: acornOptions}: {
        extensions?: Array<string>,
        acorn?: acorn.Options,
    } = {},
): Promise<string> => {
    const replacementTasks: Array<Promise<void>> = [];
    const s = new MagicString(code);
    const directory = path.dirname(sourceFile);
    const replaceSource = (node: acorn.Node) => {
        const {source} = node as unknown as NodeWithSource;
        if (typeof source.value === 'string' && source.value.startsWith('.')) {
            replacementTasks.push(
                resolveImport(source.value, directory, extensions)
                .then((resolved) => {
                    s.overwrite(source.start + 1, source.end - 1, resolved);
                }),
            );
        }
    };
    walk.simple(
        acorn.parse(code, {
            ecmaVersion: 2020,
            ...acornOptions,
            sourceType: 'module',
            sourceFile,
        }),
        {
            ImportDeclaration: replaceSource,
            ExportAllDeclaration: replaceSource,
            ImportExpression: replaceSource,
        },
    );
    await Promise.all(replacementTasks);
    return s.toString();
};

export const resolveImportsInFile = async (
    sourceFile: string,
    options: {
        extensions?: Array<string>,
        acorn?: acorn.Options,
    } = {},
): Promise<void> => await fs.promises.writeFile(
    sourceFile,
    await resolveImports(
        sourceFile,
        await fs.promises.readFile(sourceFile, 'utf8'),
        options,
    ),
);

export const resolveImportsInDirectory = async (
    directory: string,
    include: (file: string) => boolean,
    options: {
        extensions?: Array<string>,
        acorn?: acorn.Options,
    } = {},
): Promise<void> => {
    const promises: Array<ReturnType<typeof resolveImportsInFile>> = [];
    for await (const file of listFiles(directory)) {
        if (include(file)) {
            promises.push(resolveImportsInFile(file, options));
        }
    }
    await Promise.all(promises);
};
