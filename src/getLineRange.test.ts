import ava from 'ava';
import {getLineRange} from './getLineRange';

ava('getLineRange', (t) => {
    const source = [
        '123',
        '456',
        '789',
        '',
    ].join('\n');
    const getLine = (index: number): string => {
        const {start, end} = getLineRange(source, index);
        return source.slice(start, end);
    };
    t.is(getLine(0), '123\n');
    t.is(getLine(1), '123\n');
    t.is(getLine(2), '123\n');
    t.is(getLine(3), '123\n');
    t.is(getLine(4), '456\n');
    t.is(getLine(5), '456\n');
    t.is(getLine(6), '456\n');
    t.is(getLine(7), '456\n');
    t.is(getLine(8), '789\n');
    t.is(getLine(9), '789\n');
    t.is(getLine(10), '789\n');
    t.is(getLine(11), '789\n');
});
