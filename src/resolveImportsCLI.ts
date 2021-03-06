#!/usr/bin/env node
import * as path from 'path';
import * as console from 'console';
import type {Writable} from 'stream';
import {resolveImportsInDirectory} from './resolveImports';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';
import {createFileFilter} from './createFileFilter';

const parse = createCLIArgumentsParser({
    directory: {
        type: 'string',
        alias: 'd',
        description: 'A directory resolveImports processes',
    },
    ext: {
        type: 'string[]?',
        description: 'Specify extensions',
    },
    exclude: {
        type: 'string[]?',
        description: 'Specify patterns to exclude',
    },
    cjs: {
        type: 'boolean',
        description: 'Resolve the commonjs require() statements',
    },
    help: {
        type: 'boolean',
        alias: 'h',
        description: 'Show help',
    },
    version: {
        type: 'boolean',
        alias: 'v',
        description: 'Output the version number',
    },
});

export const resolveImportsCLI = async (
    args: Array<string>,
    stdout: Writable = process.stdout,
): Promise<void> => {
    if (args.includes('--help') || args.includes('-h')) {
        stdout.write('resolve-imports --directory path/to/dir\n\n');
        for (const help of serializeDefinitionMap(parse.definition)) {
            stdout.write(help);
        }
    } else if (args.includes('--version') || args.includes('-v')) {
        stdout.write(`${getVersion(path.join(__dirname, '../package.json'))}\n`);
    } else {
        const props = parse(args);
        await resolveImportsInDirectory(
            path.resolve(props.directory),
            createFileFilter({
                ext: props.ext.length ? props.ext : ['js', 'ts', 'cjs', 'mjs'],
                exclude: props.exclude,
            }),
            {
                type: props.cjs ? 'cjs' : 'esm',
            },
        );
    }
};

if (require.main === module) {
    resolveImportsCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
