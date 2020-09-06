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

export const findSourceMapInCode = async (
    {code, file}: {
        code: string,
        file: string,
    },
): Promise<RawSourceMap | null> => {
    const KeyWord = 'sourceMappingURL';
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
                const match = (/^\S+/).exec(code.slice(keywordEnd + 1, lineEnd));
                if (match) {
                    return await loadSourceMapFromUrl({
                        url: match[0],
                        file,
                    });
                }
            }
        }
        offset = lineEnd;
    }
    return null;
};

export const findSourceMap = async (
    file: string,
): Promise<RawSourceMap | null> => await findSourceMapInCode({
    code: await fs.promises.readFile(file, 'utf8'),
    file,
});
