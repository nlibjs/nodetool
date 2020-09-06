import ava from 'ava';
import {
    isRecord,
    isStringOrUndefined,
    isErrorLike,
} from './is';

ava('isRecord', (t) => {
    t.false(isRecord(undefined));
    t.false(isRecord(null));
    t.false(isRecord(Symbol('foo')));
    t.false(isRecord(true));
    t.false(isRecord(false));
    t.false(isRecord(Infinity));
    t.false(isRecord(NaN));
    t.false(isRecord(-1));
    t.false(isRecord(-0.5));
    t.false(isRecord(0));
    t.false(isRecord(0.5));
    t.false(isRecord(1));
    t.false(isRecord(''));
    t.false(isRecord('a'));
    t.true(isRecord({}));
    t.true(isRecord([]));
    t.true(isRecord(() => null));
});

ava('isStringOrUndefined', (t) => {
    t.true(isStringOrUndefined(undefined));
    t.false(isStringOrUndefined(null));
    t.false(isStringOrUndefined(Symbol('foo')));
    t.false(isStringOrUndefined(true));
    t.false(isStringOrUndefined(false));
    t.false(isStringOrUndefined(Infinity));
    t.false(isStringOrUndefined(NaN));
    t.false(isStringOrUndefined(-1));
    t.false(isStringOrUndefined(-0.5));
    t.false(isStringOrUndefined(0));
    t.false(isStringOrUndefined(0.5));
    t.false(isStringOrUndefined(1));
    t.true(isStringOrUndefined(''));
    t.true(isStringOrUndefined('a'));
    t.false(isStringOrUndefined({}));
    t.false(isStringOrUndefined([]));
    t.false(isStringOrUndefined(() => null));
});

ava('isErrorLike', (t) => {
    t.false(isErrorLike(undefined));
    t.false(isErrorLike(null));
    t.false(isErrorLike(Symbol('foo')));
    t.false(isErrorLike(true));
    t.false(isErrorLike(false));
    t.false(isErrorLike(Infinity));
    t.false(isErrorLike(NaN));
    t.false(isErrorLike(-1));
    t.false(isErrorLike(-0.5));
    t.false(isErrorLike(0));
    t.false(isErrorLike(0.5));
    t.false(isErrorLike(1));
    t.false(isErrorLike(''));
    t.false(isErrorLike('a'));
    t.true(isErrorLike({}));
    t.true(isErrorLike([]));
    t.true(isErrorLike(() => null));
    t.true(isErrorLike({
        message: '',
    }));
    t.true(isErrorLike({
        code: '',
    }));
    t.true(isErrorLike({
        message: '',
        code: '',
    }));
    t.false(isErrorLike({
        message: 0,
    }));
    t.false(isErrorLike({
        code: 0,
    }));
});
