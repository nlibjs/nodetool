import {CLIArgumentDefinitionMap, CLIArgumentDefinition, listMarkers} from './createCLIArgumentsParser';

export const serializeDefinition = function* (
    name: string,
    definition: CLIArgumentDefinition,
    {
        indent = 2,
        markersWidth = 31,
    }: {
        indent?: number,
        markersWidth?: number,
    } = {},
): Generator<string> {
    yield ' '.repeat(indent);
    let markers = [...listMarkers(name, definition)].join(', ');
    if (definition.type.startsWith('string')) {
        markers += ' [string]';
    }
    yield markers;
    if (markers.length < markersWidth) {
        yield ' '.repeat(markersWidth - markers.length);
    } else {
        yield ' ';
    }
    yield definition.description;
};


export const serializeDefinitionMap = function* (
    definitionMap: CLIArgumentDefinitionMap,
    options: {
        indent?: number,
        markersWidth?: number,
    } = {},
): Generator<string> {
    for (const name of Object.keys(definitionMap)) {
        yield* serializeDefinition(name, definitionMap[name], options);
        yield '\n';
    }
};
