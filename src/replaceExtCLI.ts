#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import * as console from 'console';
import type {Writable} from 'stream';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';
import {serializeDefinitionMap} from './serializeDefinitionMap';
import {getVersion} from './getVersion';
import {listFiles} from './listFiles';
import {findSourceMap} from './findSourceMap';
import {updateSourceMap} from './updateSourceMap';
import {fileSearchArgumentDefinition} from './nlibfgCLI';

const parse = createCLIArgumentsParser({
    ...fileSearchArgumentDefinition,
    entry: {
        type: 'string[]',
        alias: 'e',
        description: 'Specify extension mappings',
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

export const replaceExt = async (
    {file, from, to}: {
        file: string,
        from: string,
        to: string,
    },
) => {
    const sourceMap = await findSourceMap(file);
    if (sourceMap) {
        const {data} = sourceMap;
        await updateSourceMap({
            sourceMap,
            newData: {
                ...data,
                file: `${data.file.slice(0, -from.length)}${to}`,
            },
        });
    }
    await fs.promises.rename(
        file,
        `${file.slice(0, -from.length)}${to}`,
    );
};

export const replaceExtCLI = async (
    args: Array<string>,
    stdout: Writable = process.stdout,
): Promise<void> => {
    if (args.includes('--help') || args.includes('-h')) {
        stdout.write('replace-ext --directory path/to/dir --entry js/cjs [--entry mjs/js]\n\n');
        for (const help of serializeDefinitionMap(parse.definition)) {
            stdout.write(help);
        }
    } else if (args.includes('--version') || args.includes('-v')) {
        stdout.write(`${getVersion(path.join(__dirname, '../package.json'))}\n`);
    } else {
        const props = parse(args);
        const mapping = new Map(
            props.entry.map((entry) => entry.split('/').map((ext) => `.${ext}`) as [string, string]),
        );
        for await (const file of listFiles(props)) {
            const ext = path.extname(file);
            const replacement = mapping.get(ext);
            if (replacement) {
                await replaceExt({file, from: ext, to: replacement});
            }
        }
    }
};

if (require.main === module) {
    replaceExtCLI(process.argv.slice(2))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
