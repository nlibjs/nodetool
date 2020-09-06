import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import MagicString, {SourceMap} from 'magic-string';
import {listFiles} from './listFiles';
import {normalizeSlash} from './normalizeSlash';
import {resolveModule} from './resolveModule';
import {findSourceMap, findSourceMapFileFromUrl} from './findSourceMap';
import {mergeSourceMaps} from './mergeSourceMap';

interface Identifier extends acorn.Node {
    type: 'Identifier',
    name: string,
}

interface Literal extends acorn.Node {
    type: 'Literal',
    raw: string,
    value: string | boolean | null | number | RegExp,
}

interface StringLiteral extends Literal {
    value: string,
}

interface NodeWithSource extends acorn.Node {
    source: Literal,
}

interface CallExpression extends acorn.Node {
    callee: Identifier,
    arguments: Array<Literal | Identifier | acorn.Node>,
}

const isLiteral = (node: acorn.Node): node is Literal => node.type === 'Literal';
const isStringLiteral = (node: acorn.Node): node is StringLiteral => isLiteral(node) && typeof node.value === 'string';

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
        await resolveModule(path.join(realPathDirectory, importee), extensions),
    ));
    if (!relative.startsWith('.')) {
        relative = `./${relative}`;
    }
    return relative;
};

export interface ResolveImportOptions {
    type?: 'esm' | 'cjs',
    extensions?: Array<string>,
    acorn?: acorn.Options,
}

export const resolveImports = async (
    sourceFile: string,
    code: string,
    {
        type = sourceFile.endsWith('.cjs') ? 'cjs' : 'esm',
        extensions,
        acorn: acornOptions,
    }: ResolveImportOptions = {},
): Promise<{code: string, mapping: SourceMap}> => {
    const replacementTasks: Array<Promise<void>> = [];
    const s = new MagicString(code);
    const directory = path.dirname(sourceFile);
    const replaceSourceLiteral = (node: StringLiteral) => {
        replacementTasks.push(
            resolveImport(node.value, directory, extensions)
            .then((resolved) => {
                s.overwrite(node.start + 1, node.end - 1, resolved);
            }),
        );
    };
    const ast = acorn.parse(code, {ecmaVersion: 2020, ...acornOptions, sourceType: 'module', sourceFile});
    if (type === 'cjs') {
        walk.simple(ast, {
            CallExpression: (node: acorn.Node) => {
                const {callee, arguments: args} = node as unknown as CallExpression;
                if (callee.name === 'require' && args.length === 1) {
                    const firstArgument = args[0];
                    if (isStringLiteral(firstArgument)) {
                        replaceSourceLiteral(firstArgument);
                    }
                }
            },
        });
    } else {
        const replaceSource = (node: acorn.Node) => {
            const {source} = node as unknown as NodeWithSource;
            if (isStringLiteral(source) && source.value.startsWith('.')) {
                replaceSourceLiteral(source);
            }
        };
        walk.simple(ast, {
            ImportDeclaration: replaceSource,
            ExportAllDeclaration: replaceSource,
            ImportExpression: replaceSource,
        });
    }
    await Promise.all(replacementTasks);
    return {code: s.toString(), mapping: s.generateMap()};
};

export const resolveImportsInFile = async (
    file: string,
    options?: ResolveImportOptions,
): Promise<void> => {
    let code = await fs.promises.readFile(file, 'utf8');
    const result = await resolveImports(file, code, options);
    code = result.code;
    const sourceMap = await findSourceMap(file, code);
    const output = file;
    if (sourceMap) {
        const sourceMapFile = findSourceMapFileFromUrl({
            file,
            url: code.slice(sourceMap.url.start, sourceMap.url.end),
        }) || `${file}.map`;
        const s = new MagicString(code);
        s.remove(sourceMap.line.start, sourceMap.line.end);
        s.append(`//# sourceMappingURL=${normalizeSlash(path.relative(path.dirname(file), sourceMapFile))}\n`);
        await fs.promises.writeFile(sourceMapFile, JSON.stringify(
            await mergeSourceMaps(sourceMap.data, result.mapping, s.generateMap()),
            null,
            4,
        ));
        code = s.toString();
    }
    await fs.promises.writeFile(output, result.code);
};

export const resolveImportsInDirectory = async (
    directory: string,
    include: (file: string) => boolean,
    options?: ResolveImportOptions,
): Promise<void> => {
    const promises: Array<ReturnType<typeof resolveImportsInFile>> = [];
    for await (const file of listFiles(directory)) {
        if (include(file)) {
            promises.push(resolveImportsInFile(file, options));
        }
    }
    await Promise.all(promises);
};
