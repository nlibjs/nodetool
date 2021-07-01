#!/usr/bin/env node
import * as path from 'path';
import * as console from 'console';
import type {Writable} from 'stream';
import * as fg from 'fast-glob';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';

export const fileSearchArgumentDefinition = {
    include: {
        type: 'string[]?' as const,
        description: 'Specify patterns to include',
    },
    exclude: {
        type: 'string[]?' as const,
        description: 'Specify patterns to exclude',
    },
    cwd: {
        type: 'string?' as const,
        description: 'The current working directory in which to search.',
    },
};

const parse = createCLIArgumentsParser({
    ...fileSearchArgumentDefinition,
    absolute: {
        type: 'boolean',
        alias: 'h',
        description: 'When true, the output path will be an absolute path',
    },
    oneline: {
        type: 'boolean',
        alias: 'h',
        description: 'When true, the output will be concatenated with a single space',
    },
    onlyDirectories: {
        type: 'boolean',
        alias: 'h',
        description: 'Return only directories',
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

export const nlibfgCLI = async (
    args: Array<string>,
    stdout: Writable = process.stdout,
): Promise<void> => {
    if (args.includes('--help') || args.includes('-h')) {
        stdout.write('nlibfg --include \'pattern\' --exclude \'pattern\'\n\n');
        for (const help of serializeDefinitionMap(parse.definition)) {
            stdout.write(help);
        }
    } else if (args.includes('--version') || args.includes('-v')) {
        stdout.write(`${getVersion(path.join(__dirname, '../package.json'))}\n`);
    } else {
        const {include, exclude: ignore, absolute, oneline, onlyDirectories} = parse(args);
        const delimiter = oneline ? ' ' : '\n';
        for await (const line of fg.stream(include, {ignore, absolute, onlyDirectories})) {
            stdout.write(`${line}${delimiter}`);
        }
    }
};

if (require.main === module) {
    nlibfgCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
