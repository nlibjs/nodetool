export const isRecord = (
    input: unknown,
): input is Record<string, unknown> => input !== null
&& (typeof input === 'object' || typeof input === 'function');

export const isStringOrUndefined = (
    input: unknown,
): input is string | undefined => {
    const type = typeof input;
    return type === 'string' || type === 'undefined';
};

export interface ErrorLike {
    message?: string,
    code?: string,
}

export const isErrorLike = (
    input: unknown,
): input is ErrorLike => isRecord(input)
&& isStringOrUndefined(input.message)
&& isStringOrUndefined(input.code);
