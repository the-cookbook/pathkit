import { compile, match } from '@cookbook/pathkit';

const articlePath = compile('/articles/{year:range(2000,2030)}/{slug:regex([a-z0-9-]+)}');

console.log(articlePath({ year: 2026, slug: 'pathkit-release' }));
// /articles/2026/pathkit-release

const matchArticle = match('/articles/{year:range(2000,2030)}/{slug:regex([a-z0-9-]+)}');

console.log(matchArticle('/articles/2026/pathkit-release'));
// { match: true, params: { year: '2026', slug: 'pathkit-release' } }

console.log(matchArticle('/articles/1999/pathkit-release'));
// { match: false, params: null }
