import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import MagicString from 'magic-string';
import {listFiles} from './listFiles';
import {normalizeSlash} from './normalizeSlash';

interface Literal extends acorn.Node {
    raw: string,
    value: string | boolean | null | number | RegExp,
}

interface NodeWithSource extends acorn.Node {
    source: Literal,
}

export const resolveImport = (
    importee: string,
    directory: string,
): string => {
    let relative = normalizeSlash(path.relative(
        fs.realpathSync(directory),
        require.resolve(path.join(directory, importee)),
    ));
    if (!relative.startsWith('.')) {
        relative = `./${relative}`;
    }
    return relative;
};

export const resolveImports = (
    sourceFile: string,
    code: string,
    acornOptions?: acorn.Options,
): string => {
    const s = new MagicString(code);
    const directory = path.dirname(sourceFile);
    const replaceSource = (node: acorn.Node) => {
        const {source} = node as unknown as NodeWithSource;
        if (typeof source.value === 'string') {
            s.overwrite(
                source.start + 1,
                source.end - 1,
                resolveImport(source.value, directory),
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
    return s.toString();
};

export const resolveImportsInFile = async (
    sourceFile: string,
    acornOptions?: acorn.Options,
): Promise<void> => await fs.promises.writeFile(
    sourceFile,
    resolveImports(
        sourceFile,
        await fs.promises.readFile(sourceFile, 'utf8'),
        acornOptions,
    ),
);


export const resolveImportsInDirectory = async (
    directory: string,
    include: (file: string) => boolean,
    acornOptions?: acorn.Options,
): Promise<void> => {
    const promises: Array<ReturnType<typeof resolveImportsInFile>> = [];
    for await (const file of listFiles(directory)) {
        if (include(file)) {
            promises.push(resolveImportsInFile(file, acornOptions));
        }
    }
    await Promise.all(promises);
};
