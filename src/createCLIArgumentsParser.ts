import * as util from 'util';

export const listMarkerIndex = function* (
    {markers, args}: {
        markers: Array<string>,
        args: Array<string>,
    },
): Generator<number> {
    const {length} = args;
    for (let index = 0; index < length; index++) {
        if (markers.includes(args[index])) {
            yield index;
        }
    }
};

export const getBoolean = (
    props: {
        name: string,
        markers: Array<string>,
        args: Array<string>,
    },
): boolean => {
    const indexIterator = listMarkerIndex(props);
    const result = indexIterator.next();
    if (result.done) {
        return false;
    }
    if (!indexIterator.next().done) {
        throw new Error(`DuplicatedFlag: --${props.name}`);
    }
    return true;
};

export const getString = (
    props: {
        name: string,
        markers: Array<string>,
        args: Array<string>,
        optional: boolean,
    },
): string | undefined => {
    const indexIterator = listMarkerIndex(props);
    const result = indexIterator.next();
    if (result.done) {
        if (props.optional) {
            return undefined;
        } else {
            throw new Error(`NoArgument: --${props.name}`);
        }
    }
    if (!indexIterator.next().done) {
        throw new Error(`DuplicatedArgument: --${props.name}`);
    }
    const {value: index} = result;
    if (props.args.length - 1 <= index) {
        throw new Error(`UnexpectedPosition: --${props.name}`);
    }
    const value = props.args[index + 1];
    if (value.startsWith('-')) {
        throw new Error(`InvalidValue: --${props.name}`);
    }
    return value;
};

export const getStringArray = (
    props: {
        name: string,
        markers: Array<string>,
        args: Array<string>,
        optional: boolean,
    },
): Array<string> => {
    const result: Array<string> = [];
    const {args} = props;
    const maxIndex = args.length - 1;
    for (const index of listMarkerIndex(props)) {
        if (maxIndex <= index) {
            throw new Error(`UnexpectedPosition: --${props.name}`);
        }
        const value = props.args[index + 1];
        if (value.startsWith('-')) {
            throw new Error(`InvalidValue: --${props.name}`);
        }
        result.push(value);
    }
    if (!props.optional && result.length === 0) {
        throw new Error(`NoArgument: --${props.name}`);
    }
    return result;
};

export const validateParseResult = <T extends CLIArgumentDefinitionMap>(
    definitionMap: T,
    result: Record<string, boolean | string | Array<string> | undefined>,
): result is CLIArgumentMap<T> => {
    for (const name of Object.keys(definitionMap)) {
        const definition = definitionMap[name];
        const value = result[name];
        switch (typeof value) {
        case 'undefined':
            if (definition.type !== 'string?') {
                return false;
            }
            break;
        case 'boolean':
            if (definition.type !== 'boolean') {
                return false;
            }
            break;
        case 'string':
            if (!definition.type.startsWith('string')) {
                return false;
            }
            break;
        default:
            if (!definition.type.startsWith('string[]')) {
                return false;
            }
        }
    }
    return true;
};

export const listMarkers = function* (
    name: string,
    definition: CLIArgumentDefinition,
): Generator<string> {
    yield `--${name}`;
    if (definition.alias) {
        yield `-${definition.alias}`;
    }
};

export interface CLIArgumentDefinition {
    readonly type: 'boolean' | 'string' | 'string[]' | 'string?' | 'string[]?',
    readonly description: string,
    readonly alias?: string,
}

export interface CLIArgumentDefinitionMap extends Readonly<Record<string, CLIArgumentDefinition>> {}

export type CLIArgumentValue<T extends CLIArgumentDefinition> =
T['type'] extends 'boolean' ? boolean
: T['type'] extends 'string' ? string
: T['type'] extends 'string?' ? string | undefined
: T['type'] extends 'string[]' | 'string[]?' ? Array<string>
: never;

export type CLIArgumentMap<T extends CLIArgumentDefinitionMap> = {
    [K in keyof T]: CLIArgumentValue<T[K]>;
};

export interface CLIArgumentsParser<T extends CLIArgumentDefinitionMap> {
    readonly definition: T,
    (args: Array<string>): CLIArgumentMap<T>,
}

export const createCLIArgumentsParser = <T extends CLIArgumentDefinitionMap>(
    definitionMap: T,
) => Object.defineProperty(
    (
        args: Array<string>,
    ) => {
        const result: Record<string, string | Array<string> | boolean | undefined> = {};
        for (const name of Object.keys(definitionMap)) {
            const definition = definitionMap[name];
            const markers = [...listMarkers(name, definition)];
            switch (definition.type) {
            case 'boolean':
                result[name] = getBoolean({name, markers, args});
                break;
            case 'string':
                result[name] = getString({name, markers, args, optional: false});
                break;
            case 'string?':
                result[name] = getString({name, markers, args, optional: true});
                break;
            default:
                result[name] = getStringArray({
                    name,
                    markers,
                    args,
                    optional: definition.type.endsWith('?'),
                });
            }
        }
        if (validateParseResult(definitionMap, result)) {
            return result;
        }
        throw new Error(`InvalidInput: ${util.inspect(result)}`);
    },
    'definition',
    {value: definitionMap},
) as CLIArgumentsParser<T>;
