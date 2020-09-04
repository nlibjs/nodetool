import ava from 'ava';
import {createCLIArgumentsParser} from './createCLIArgumentsParser';

ava('boolean → false', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'boolean', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['']), {foo: false});
});
ava('boolean → true', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'boolean', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['--foo']), {foo: true});
});
ava('boolean → true (alias)', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'boolean', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['-a']), {foo: true});
});
ava('boolean → DuplicatedFlag', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'boolean', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo', '-a']),
        {message: /^DuplicatedFlag/},
    );
});
ava('string → NoArgument', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['']),
        {message: /^NoArgument/},
    );
});
ava('string → DuplicatedArgument', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo', '-a']),
        {message: /^DuplicatedArgument/},
    );
});
ava('string → UnexpectedPosition', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo']),
        {message: /^UnexpectedPosition/},
    );
});
ava('string → bar', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['--foo', 'bar']), {foo: 'bar'});
});
ava('string → bar (alias)', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['-a', 'bar']), {foo: 'bar'});
});
ava('string → InvalidValue', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo', '--bar']),
        {message: /^InvalidValue/},
    );
});
ava('string? → undefined', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string?', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse([]), {foo: undefined});
});
ava('string? → UnexpectedPosition', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string?', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo']),
        {message: /^UnexpectedPosition/},
    );
});
ava('string? → bar', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string?', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['--foo', 'bar']), {foo: 'bar'});
});
ava('string? → bar (alias)', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string?', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['-a', 'bar']), {foo: 'bar'});
});
ava('string[] → NoArgument', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string[]', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse([]),
        {message: /^NoArgument/},
    );
});
ava('string[] → bar1', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string[]', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse(['--foo', 'bar1']), {foo: ['bar1']});
});
ava('string[] → bar1 bar2 bar3', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string[]', alias: 'a', description: 'foo'},
    });
    t.deepEqual(
        parse(['--foo', 'bar1', '-a', 'bar2', '--foo', 'bar3']),
        {foo: ['bar1', 'bar2', 'bar3']},
    );
});
ava('string[] → UnexpectedPosition', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string[]', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo', 'bar1', '-a', 'bar2', '--foo']),
        {message: /^UnexpectedPosition/},
    );
});
ava('string[] → InvalidValue', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string[]', alias: 'a', description: 'foo'},
    });
    t.throws(
        () => parse(['--foo', 'bar1', '-a', '--foo', 'bar2']),
        {message: /^InvalidValue/},
    );
});
ava('string[]? → []', (t) => {
    const parse = createCLIArgumentsParser({
        foo: {type: 'string[]?', alias: 'a', description: 'foo'},
    });
    t.deepEqual(parse([]), {foo: []});
});
