import * as fs from 'fs';
import * as path from 'path';
import {Buffer} from 'buffer';
import {RawSourceMap} from 'source-map';
import {getLineRange} from './getLineRange';
import {isRecord} from './is';

export const loadSourceMapFromJSONString = (
    jsonString: Buffer | string,
): RawSourceMap => {
    const result = JSON.parse(`${Buffer.from(jsonString)}`) as unknown;
    if (
        isRecord(result) &&
        typeof result.version === 'number' &&
        Array.isArray(result.sources) &&
        Array.isArray(result.names) &&
        typeof result.mappings === 'string' &&
        typeof result.file === 'string') {
        return result as unknown as RawSourceMap;
    }
    throw new Error(`InvalidSourcemap: ${jsonString}`);
};

export const loadSourceMapFromUrl = async (
    {url, file}: {
        url: string,
        file: string,
    },
): Promise<RawSourceMap | null> => {
    if (url.startsWith('data:')) {
        const commaIndex = url.indexOf(',', 5);
        if (5 < commaIndex) {
            const base64 = url.slice(0, commaIndex).endsWith('base64');
            return loadSourceMapFromJSONString(
                base64 ? Buffer.from(
                    url.slice(commaIndex + 1),
                    'base64',
                ) : Buffer.from(decodeURIComponent(url.slice(commaIndex + 1))),
            );
        }
    }
    if (!url.includes('://')) {
        return loadSourceMapFromJSONString(
            await fs.promises.readFile(path.resolve(path.dirname(file), url)),
        );
    }
    return null;
};

export const findSourceMapFileFromUrl = (
    {url, file}: {
        url: string,
        file: string,
    },
): string | null => {
    if (!url.startsWith('data:') || !url.includes('://')) {
        return path.resolve(path.dirname(file), url);
    }
    return null;
};

export const SourceMapLeftPartRegExp = /^\s*\/[/*]\s*[#@]\s*$/;

export interface FoundSourceMap {
    file: string,
    code: string,
    line: {
        start: number,
        end: number,
    },
    url: {
        start: number,
        end: number,
    },
    data: RawSourceMap,
}

export const SourceMapKeyword = 'sourceMappingURL';

export const findSourceMap = async (
    file: string,
    codeString?: string,
): Promise<FoundSourceMap | null> => {
    const code = codeString || await fs.promises.readFile(file, 'utf8');
    const {length} = code;
    let offset = 0;
    while (offset < length) {
        const keywordStart = code.indexOf(SourceMapKeyword, offset);
        if (keywordStart < 0) {
            break;
        }
        const line = getLineRange(code, keywordStart);
        if (SourceMapLeftPartRegExp.test(code.slice(line.start, keywordStart))) {
            const keywordEnd = keywordStart + 16;
            if (code[keywordEnd] === '=') {
                const urlStart = keywordEnd + 1;
                const match = (/^\S+/).exec(code.slice(urlStart, line.end));
                if (match) {
                    const url = match[0];
                    const data = await loadSourceMapFromUrl({url, file});
                    if (data) {
                        return {
                            file,
                            code,
                            line,
                            url: {
                                start: urlStart,
                                end: urlStart + url.length,
                            },
                            data,
                        };
                    }
                }
            }
        }
        offset = line.end;
    }
    return null;
};
