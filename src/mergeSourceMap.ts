import {
    RawSourceMap,
    SourceMapConsumer,
    SourceMapGenerator,
} from 'source-map';

export const mergeSourceMaps = async (
    first: RawSourceMap,
    ...list: Array<RawSourceMap>
): Promise<RawSourceMap> => {
    const generator = SourceMapGenerator.fromSourceMap(await new SourceMapConsumer(first));
    for (const map of list) {
        generator.applySourceMap(await new SourceMapConsumer(map));
    }
    return generator.toJSON();
};
