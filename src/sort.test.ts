import ava from 'ava';
import * as sort from './sort';

let index = 0;
const test = <T>(
    {comparator, array, expected}: {
        comparator: sort.CompareFunction<T>,
        array: Array<T>,
        expected: Array<T>,
    },
) => {
    ava(`#${++index} ${JSON.stringify(array)} → ${JSON.stringify(expected)}`, (t) => {
        const actual = array.slice().sort(comparator);
        t.deepEqual(actual, expected);
    });
};

test({
    comparator: sort.asc,
    array: [4, 3, 0, 1, 2],
    expected: [0, 1, 2, 3, 4],
});
test({
    comparator: sort.desc,
    array: [4, 3, 0, 1, 2],
    expected: [4, 3, 2, 1, 0],
});
test({
    comparator: sort.asc,
    array: ['a', 'A', 'B', 'b'],
    expected: ['A', 'B', 'a', 'b'],
});
test({
    comparator: sort.desc,
    array: ['a', 'A', 'B', 'b'],
    expected: ['b', 'a', 'B', 'A'],
});
test({
    comparator: sort.dictionaryAsc,
    array: ['ぃ', 'a', 'あ', 'A', 'い', 'B', 'ぁ', 'b'],
    expected: ['A', 'a', 'B', 'b', 'ぁ', 'あ', 'ぃ', 'い'],
});
test({
    comparator: sort.dictionaryDesc,
    array: ['ぃ', 'a', 'あ', 'A', 'い', 'B', 'ぁ', 'b'],
    expected: ['い', 'ぃ', 'あ', 'ぁ', 'b', 'B', 'a', 'A'],
});
