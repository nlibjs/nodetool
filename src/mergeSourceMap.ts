import {
    Position,
    RawSourceMap,
    SourceMapConsumer,
    SourceMapGenerator,
} from 'source-map';

export const mergeSourceMap = async (
    from: RawSourceMap,
    to: RawSourceMap,
): Promise<RawSourceMap> => {
    const resultMap = new SourceMapGenerator({file: from.file});
    await SourceMapConsumer.with(from, null, async (fromConsumer) => {
        return await SourceMapConsumer.with(to, null, (toConsumer) => {
            fromConsumer.eachMapping((mapping) => {
                const generatedPosition = {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn,
                };
                const fromOriginalPosition = {
                    line: mapping.originalLine,
                    column: mapping.originalColumn,
                };
                const originalPosition = toConsumer.originalPositionFor(fromOriginalPosition);
                const {source: originalSource} = originalPosition;
                if (originalSource !== null) {
                    resultMap.addMapping({
                        source: originalSource,
                        name: originalPosition.name || undefined,
                        generated: generatedPosition,
                        original: originalPosition as Position,
                    });
                    resultMap.setSourceContent(
                        originalSource,
                        toConsumer.sourceContentFor(originalSource) as string,
                    );
                }
            });
        });
    });
    return resultMap.toJSON();
};

export const mergeSourceMaps = async (
    first: RawSourceMap,
    ...list: Array<RawSourceMap>
): Promise<RawSourceMap> => {
    let result = first;
    for (const map of list) {
        result = await mergeSourceMap(result, map);
    }
    return result;
};
