import ava from 'ava';
import {parseCLIArguments} from './parseCLIArguments';

ava('boolean → false', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'boolean', alias: 'a', description: 'foo'},
            },
            [''],
        ),
        {foo: false},
    );
});
ava('boolean → true', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'boolean', alias: 'a', description: 'foo'},
            },
            ['--foo'],
        ),
        {foo: true},
    );
});
ava('boolean → true (alias)', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'boolean', alias: 'a', description: 'foo'},
            },
            ['-a'],
        ),
        {foo: true},
    );
});
ava('boolean → DuplicatedFlag', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'boolean', alias: 'a', description: 'foo'},
            },
            ['--foo', '-a'],
        ),
        {message: /^DuplicatedFlag/},
    );
});
ava('string → NoArgument', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string', alias: 'a', description: 'foo'},
            },
            [''],
        ),
        {message: /^NoArgument/},
    );
});
ava('string → DuplicatedArgument', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string', alias: 'a', description: 'foo'},
            },
            ['--foo', '-a'],
        ),
        {message: /^DuplicatedArgument/},
    );
});
ava('string → UnexpectedPosition', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string', alias: 'a', description: 'foo'},
            },
            ['--foo'],
        ),
        {message: /^UnexpectedPosition/},
    );
});
ava('string → bar', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string', alias: 'a', description: 'foo'},
            },
            ['--foo', 'bar'],
        ),
        {foo: 'bar'},
    );
});
ava('string → bar (alias)', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string', alias: 'a', description: 'foo'},
            },
            ['-a', 'bar'],
        ),
        {foo: 'bar'},
    );
});
ava('string → InvalidValue', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string', alias: 'a', description: 'foo'},
            },
            ['--foo', '--bar'],
        ),
        {message: /^InvalidValue/},
    );
});
ava('string? → undefined', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string?', alias: 'a', description: 'foo'},
            },
            [''],
        ),
        {foo: undefined},
    );
});
ava('string? → UnexpectedPosition', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string?', alias: 'a', description: 'foo'},
            },
            ['--foo'],
        ),
        {message: /^UnexpectedPosition/},
    );
});
ava('string? → bar', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string?', alias: 'a', description: 'foo'},
            },
            ['--foo', 'bar'],
        ),
        {foo: 'bar'},
    );
});
ava('string? → bar (alias)', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string?', alias: 'a', description: 'foo'},
            },
            ['-a', 'bar'],
        ),
        {foo: 'bar'},
    );
});
ava('string[] → NoArgument', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string[]', alias: 'a', description: 'foo'},
            },
            [''],
        ),
        {message: /^NoArgument/},
    );
});
ava('string[] → bar1', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string[]', alias: 'a', description: 'foo'},
            },
            ['--foo', 'bar1'],
        ),
        {foo: ['bar1']},
    );
});
ava('string[] → bar1 bar2 bar3', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string[]', alias: 'a', description: 'foo'},
            },
            ['--foo', 'bar1', '-a', 'bar2', '--foo', 'bar3'],
        ),
        {foo: ['bar1', 'bar2', 'bar3']},
    );
});
ava('string[] → UnexpectedPosition', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string[]', alias: 'a', description: 'foo'},
            },
            ['--foo', 'bar1', '-a', 'bar2', '--foo'],
        ),
        {message: /^UnexpectedPosition/},
    );
});
ava('string[] → InvalidValue', (t) => {
    t.throws(
        () => parseCLIArguments(
            {
                foo: {type: 'string[]', alias: 'a', description: 'foo'},
            },
            ['--foo', 'bar1', '-a', '--foo', 'bar2'],
        ),
        {message: /^InvalidValue/},
    );
});
ava('string[]? → []', (t) => {
    t.deepEqual(
        parseCLIArguments(
            {
                foo: {type: 'string[]?', alias: 'a', description: 'foo'},
            },
            [''],
        ),
        {foo: []},
    );
});
