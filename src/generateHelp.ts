import {CLIArgumentDefinitionMap} from './parseCLIArguments';

export const generateHelp = function* (
    definitionMap: CLIArgumentDefinitionMap,
): Generator<string> {
    definitionMap.toString();
    yield '';
};
