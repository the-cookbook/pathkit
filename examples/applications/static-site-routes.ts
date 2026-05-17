import { compile } from '@the-cookbook/pathkit';

const docsPath = compile('/docs/{section}/{slug}');

const docs = [
  { section: 'guide', slug: 'getting-started' },
  { section: 'api', slug: 'compile' },
  { section: 'api', slug: 'match' },
];

const staticPaths = docs.map((doc) => docsPath(doc));

console.log(staticPaths);
// [
//   '/docs/guide/getting-started',
//   '/docs/api/compile',
//   '/docs/api/match'
// ]
