import * as fg from 'fast-glob';

interface ListFilesProps {
    cwd?: string,
    include: Array<string>,
    exclude: Array<string>,
}

export const listFiles = (
    {cwd, include, exclude: ignore}: ListFilesProps,
): AsyncGenerator<string> => fg.stream(include, {cwd, ignore, absolute: true}) as unknown as AsyncGenerator<string>;
