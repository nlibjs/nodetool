#!/usr/bin/env node
import * as path from 'path';
import * as console from 'console';
import type {Writable} from 'stream';
import {resolveImportsInFile} from './resolveImports';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';
import {fileSearchArgumentDefinition} from './nlibfgCLI';
import {listFiles} from './listFiles';

const parse = createCLIArgumentsParser({
    ...fileSearchArgumentDefinition,
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
        const promises: Array<Promise<void>> = [];
        const type = props.cjs ? 'cjs' : 'esm';
        for await (const file of listFiles(props)) {
            promises.push(resolveImportsInFile(`${file}`, {type}));
        }
        await Promise.all(promises);
    }
};

if (require.main === module) {
    resolveImportsCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
