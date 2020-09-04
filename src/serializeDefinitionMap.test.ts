import ava from 'ava';
import {serializeDefinitionMap} from './serializeDefinitionMap';

ava('empty', (t) => {
    const iterator = serializeDefinitionMap({});
    t.deepEqual(iterator.next(), {done: true, value: undefined});
});
ava('boolean', (t) => {
    const actual = [
        ...serializeDefinitionMap({
            foo: {
                type: 'boolean',
                description: 'abc def',
                alias: 'f',
            },
        }),
    ].join('');
    t.is(actual, [
        '  --foo, -f                      abc def\n',
    ].join(''));
});
ava('string', (t) => {
    const actual = [
        ...serializeDefinitionMap({
            foo: {
                type: 'string',
                description: 'abc def',
                alias: 'f',
            },
        }),
    ].join('');
    t.is(actual, [
        '  --foo, -f [string]             abc def\n',
    ].join(''));
});
ava('string?', (t) => {
    const actual = [
        ...serializeDefinitionMap({
            foo: {
                type: 'string?',
                description: 'abc def',
                alias: 'f',
            },
        }),
    ].join('');
    t.is(actual, [
        '  --foo, -f [string]             abc def\n',
    ].join(''));
});
ava('string[]', (t) => {
    const actual = [
        ...serializeDefinitionMap({
            foo: {
                type: 'string[]',
                description: 'abc def',
                alias: 'f',
            },
        }),
    ].join('');
    t.is(actual, [
        '  --foo, -f [string]             abc def\n',
    ].join(''));
});
ava('string[]?', (t) => {
    const actual = [
        ...serializeDefinitionMap({
            foo: {
                type: 'string[]?',
                description: 'abc def',
                alias: 'f',
            },
        }),
    ].join('');
    t.is(actual, [
        '  --foo, -f [string]             abc def\n',
    ].join(''));
});
ava('mixed', (t) => {
    const actual = [
        ...serializeDefinitionMap({
            foo: {
                type: 'boolean',
                description: 'abc def',
                alias: 'f',
            },
            bar: {
                type: 'string',
                description: 'xyz',
                alias: 'b',
            },
        }),
    ].join('');
    t.is(actual, [
        '  --foo, -f                      abc def\n',
        '  --bar, -b [string]             xyz\n',
    ].join(''));
});
