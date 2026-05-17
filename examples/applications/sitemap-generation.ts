import { compile } from '@the-cookbook/pathkit';

const postPath = compile('/blog/{year:range(2000,2030)}/{slug:regex([a-z0-9-]+)}');

const posts = [
  { year: 2025, slug: 'routing-in-typescript' },
  { year: 2026, slug: 'pathkit-release' },
];

const urls = posts.map((post) => postPath(post));

console.log(urls);
// [
//   '/blog/2025/routing-in-typescript',
//   '/blog/2026/pathkit-release'
// ]
