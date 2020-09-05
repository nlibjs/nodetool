export type CompareFunction<T> = (v1: T, v2: T) => number;

export const asc: CompareFunction<number | string> = (
    v1,
    v2,
) => v1 < v2 ? -1 : 1;

export const desc: CompareFunction<number | string> = (
    v1,
    v2,
) => v1 < v2 ? 1 : -1;

export const dictionaryAsc: CompareFunction<string> = (
    v1,
    v2,
) => {
    const normalized1 = v1.toLowerCase();
    const normalized2 = v2.toLowerCase();
    if (normalized1 === normalized2) {
        return v1 < v2 ? -1 : 1;
    }
    return normalized1 < normalized2 ? -1 : 1;
};

export const dictionaryDesc: CompareFunction<string> = (
    v1,
    v2,
) => dictionaryAsc(v2, v1);
