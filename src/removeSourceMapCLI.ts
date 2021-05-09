#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as console from 'console';
import type {Writable} from 'stream';
import * as fg from 'fast-glob';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';
import {SourceMapLeftPartRegExp, SourceMapKeyword} from './findSourceMap';
import {getLineRange} from './getLineRange';
import {fileSearchArgumentDefinition} from './nlibfgCLI';

const parse = createCLIArgumentsParser({
    ...fileSearchArgumentDefinition,
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

export const removeSourceMapLines = (source: string): string => {
    let code = source;
    let offset = code.length;
    while (0 <= offset) {
        const keywordIndex = code.lastIndexOf(SourceMapKeyword, offset);
        if (keywordIndex < 0) {
            break;
        }
        const line = getLineRange(code, keywordIndex);
        if (SourceMapLeftPartRegExp.test(code.slice(line.start, keywordIndex))) {
            code = `${code.slice(0, line.start)}${code.slice(line.end)}`;
        }
        offset = line.start - 1;
    }
    return code;
};

export const removeSourceMap = async (
    file: string,
): Promise<void> => await fs.promises.writeFile(
    file,
    removeSourceMapLines(await fs.promises.readFile(file, 'utf8')),
);

export const removeSourceMapCLI = async (
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
        for await (const file of fg.stream(props.include, {cwd: props.cwd, ignore: props.exclude, absolute: true})) {
            promises.push(removeSourceMap(`${file}`));
        }
        await Promise.all(promises);
    }
};

if (require.main === module) {
    removeSourceMapCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
