#!/usr/bin/env node
import * as path from 'path';
import * as console from 'console';
import {Writable} from 'stream';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';
import {cleanupPackageJSONFile} from './cleanupPackageJson';

const parse = createCLIArgumentsParser({
    file: {
        type: 'string',
        alias: 'f',
        description: 'A path to a package.json',
    },
    keep: {
        type: 'string[]?',
        description: 'Specify keys to keep in output',
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

export const cleanupPackageJsonCLI = async (
    args: Array<string>,
    stdout: Writable = process.stdout,
): Promise<void> => {
    if (args.includes('--help') || args.includes('-h')) {
        stdout.write('cleanup-package-json --file path/to/package.json\n\n');
        for (const help of serializeDefinitionMap(parse.definition)) {
            stdout.write(help);
        }
    } else if (args.includes('--version') || args.includes('-v')) {
        stdout.write(`${getVersion(path.join(__dirname, '../package.json'))}\n`);
    } else {
        const {file, ...options} = parse(args);
        await cleanupPackageJSONFile(path.resolve(file), options);
    }
};

if (require.main === module) {
    cleanupPackageJsonCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
