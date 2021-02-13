#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import * as console from 'console';
import {Writable} from 'stream';
import {indexen} from './indexen';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';
import {createFileFilter} from './createFileFilter';
import {normalizeSlash} from './normalizeSlash';

const parse = createCLIArgumentsParser({
    input: {
        type: 'string',
        alias: 'i',
        description: 'A directory indexen reads from',
    },
    output: {
        type: 'string',
        alias: 'o',
        description: 'A file path indexen writes to',
    },
    ext: {
        type: 'string[]?',
        description: 'Specify extensions',
    },
    exclude: {
        type: 'string[]?',
        description: 'Specify patterns to exclude',
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
export const indexenHeader = '// Generated by @nlib/nodetool indexen';
export const indexenCLI = async (
    args: Array<string>,
    stdout: Writable = process.stdout,
): Promise<void> => {
    if (args.includes('--help') || args.includes('-h')) {
        stdout.write('indexen --input path/to/dir --output path/to/dir/index.js\n\n');
        for (const help of serializeDefinitionMap(parse.definition)) {
            stdout.write(help);
        }
    } else if (args.includes('--version') || args.includes('-v')) {
        stdout.write(`${getVersion(path.join(__dirname, '../package.json'))}\n`);
    } else {
        const props = parse(args);
        const output = path.resolve(props.output);
        const directory = path.resolve(props.input);
        const params = {
            directory,
            output,
            include: createFileFilter({
                ext: props.ext.length ? props.ext : ['js', 'ts', 'cjs', 'mjs'],
                exclude: (props.exclude.length ? props.exclude : [
                    normalizeSlash(`${directory}/**/*.d.ts`),
                    normalizeSlash(`${directory}/**/*.test.*`),
                    normalizeSlash(`${directory}/**/test/**/*`),
                ])
                .concat(normalizeSlash(output)),
            }),
        };
        const stream = fs.createWriteStream(params.output);
        stream.write(`${indexenHeader}\n`);
        for await (const line of indexen(params)) {
            stream.write(line);
        }
        stream.close();
    }
};

if (require.main === module) {
    indexenCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
