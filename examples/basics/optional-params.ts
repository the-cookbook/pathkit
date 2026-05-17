import { compile, match } from '@cookbook/pathkit';

const compileSearch = compile('/search/{category?}/{term?}');

console.log(compileSearch());
// /search

console.log(compileSearch({ category: 'books' }));
// /search/books

console.log(compileSearch({ category: 'books', term: 'typescript' }));
// /search/books/typescript

const matchSearch = match('/search/{category?}/{term?}');

console.log(matchSearch('/search/books/typescript'));
// { match: true, params: { category: 'books', term: 'typescript' } }
