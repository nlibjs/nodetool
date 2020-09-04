import ava from 'ava';
import {createFileFilter} from './createFileFilter';

ava('empty', (t) => {
    const filter = createFileFilter();
    t.false(filter(''));
    t.true(filter('index'));
    t.true(filter('index.js'));
    t.true(filter('index.ts'));
});

ava('empty extensions', (t) => {
    const filter = createFileFilter({extensions: []});
    t.false(filter(''));
    t.false(filter('index'));
    t.false(filter('index.js'));
    t.false(filter('index.ts'));
});

ava('extensions: [.js]', (t) => {
    const filter = createFileFilter({extensions: ['.js']});
    t.false(filter(''));
    t.false(filter('index'));
    t.true(filter('index.js'));
    t.false(filter('index.ts'));
});
