import * as fs from 'fs';
import * as path from 'path';
import {RawSourceMap} from 'source-map';
import {isRecord} from './is';

export const loadSourceMapFromJSONString = (
    jsonString: string | Buffer,
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

const LeftPartRegExp = /^\s*\/[/*]\s*[#@]\s*$/;

export interface FoundSourceMap {
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

export const findSourceMap = async (
    file: string,
    codeString?: string,
): Promise<FoundSourceMap | null> => {
    const KeyWord = 'sourceMappingURL';
    const code = codeString || await fs.promises.readFile(file, 'utf8');
    const {length} = code;
    let offset = 0;
    while (offset < length) {
        const keywordStart = code.indexOf(KeyWord, offset);
        const lineStart = code.lastIndexOf('\n', keywordStart) + 1;
        let lineEnd = code.indexOf('\n', keywordStart + 16);
        if (lineEnd < 0) {
            lineEnd = length;
        }
        if (LeftPartRegExp.test(code.slice(lineStart, keywordStart))) {
            const keywordEnd = keywordStart + 16;
            if (code[keywordEnd] === '=') {
                const urlStart = keywordEnd + 1;
                const match = (/^\S+/).exec(code.slice(urlStart, lineEnd));
                if (match) {
                    const url = match[0];
                    const data = await loadSourceMapFromUrl({url, file});
                    if (data) {
                        return {
                            line: {
                                start: lineStart,
                                end: lineEnd,
                            },
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
        offset = lineEnd;
    }
    return null;
};
