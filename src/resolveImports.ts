import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import MagicString, {SourceMap} from 'magic-string';
import {listFiles} from './listFiles';
import {normalizeSlash} from './normalizeSlash';
import {resolveModule} from './resolveModule';
import {findSourceMap} from './findSourceMap';
import {mergeSourceMaps} from './mergeSourceMap';
import {updateSourceMap} from './updateSourceMap';

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
    const replaceSourceLiteral = (node: acorn.Node) => {
        if (isStringLiteral(node) && node.value.startsWith('.')) {
            replacementTasks.push(
                resolveImport(node.value, directory, extensions)
                .then((resolved) => {
                    s.overwrite(node.start + 1, node.end - 1, resolved);
                }),
            );
        }
    };
    const ast = acorn.parse(code, {ecmaVersion: 2020, ...acornOptions, sourceType: 'module', sourceFile});
    if (type === 'cjs') {
        walk.simple(ast, {
            CallExpression: (node: acorn.Node) => {
                const {callee, arguments: args} = node as unknown as CallExpression;
                if (callee.name === 'require' && args.length === 1) {
                    replaceSourceLiteral(args[0]);
                }
            },
        });
    } else {
        const replaceSource = (node: acorn.Node) => {
            replaceSourceLiteral((node as unknown as NodeWithSource).source);
        };
        walk.simple(ast, {
            ImportDeclaration: replaceSource,
            ExportAllDeclaration: replaceSource,
            ImportExpression: replaceSource,
        });
    }
    await Promise.all(replacementTasks);
    const source = path.basename(sourceFile);
    return {
        code: s.toString(),
        mapping: s.generateMap({source, file: source}),
    };
};

export const resolveImportsInFile = async (
    file: string,
    options?: ResolveImportOptions,
): Promise<void> => {
    const originalCode = await fs.promises.readFile(file, 'utf8');
    const result = await resolveImports(file, originalCode, options);
    const sourceMap = await findSourceMap(file, result.code);
    if (sourceMap) {
        await updateSourceMap({
            sourceMap,
            newData: await mergeSourceMaps(
                sourceMap.data,
                result.mapping,
            ),
        });
    } else {
        await fs.promises.writeFile(file, result.code);
    }
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
