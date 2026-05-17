import { compile, match, registerConstraint, resetConstraints } from '@cookbook/pathkit';
import type { ConstraintValidation } from '@cookbook/pathkit';

const slug: ConstraintValidation = Object.assign(
  (paramName: string, value: string | number | boolean | undefined) => {
    if (typeof value !== 'string' || !/^[a-z0-9-]+$/.test(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid slug`);
    }
  },
  {
    verify: () => undefined,
    toRegExp: () => '[a-z0-9-]+',
  },
);

registerConstraint('slug', slug);

const postPath = compile('/posts/{slug:slug}');
const matchPost = match('/posts/{slug:slug}');

console.log(postPath({ slug: 'hello-world' }));
// /posts/hello-world

console.log(matchPost('/posts/hello-world'));
// { match: true, params: { slug: 'hello-world' } }

resetConstraints();
