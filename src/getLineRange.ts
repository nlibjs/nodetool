export const getLineStart = (
    source: string,
    index: number,
): number => {
    const start = source.lastIndexOf('\n', index);
    if (start < 0) {
        return 0;
    }
    return start === index ? getLineStart(source, index - 1) : start + 1;
};

export const getLineEnd = (
    source: string,
    index: number,
): number => {
    const end = source.indexOf('\n', index);
    return end < 0 ? source.length : end + 1;
};

export const getLineRange = (
    source: string,
    index: number,
): {start: number, end: number} => ({
    start: getLineStart(source, index),
    end: getLineEnd(source, index),
});
