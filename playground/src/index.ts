import {
  compile,
  match,
  createConstraint,
  registerConstraint,
  resetConstraints,
} from '@cookbook/pathkit';

const assertThrows = (callback: () => void, expectedMessage: string, message: string): void => {
  try {
    callback();
  } catch (error) {
    if (error instanceof Error && error.message === expectedMessage) {
      return;
    }

    throw new Error(
      `${message}\nExpected error: ${expectedMessage}\nActual error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  throw new Error(`${message}\nExpected function to throw.`);
};

const assertEqual = <T>(actual: T, expected: T, message: string): void => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nExpected: ${expectedJson}\nActual: ${actualJson}`);
  }
};

const toUser = compile('/users/{id:int}');

assertEqual(toUser({ id: 42 }), '/users/42', 'compile() should generate int route');

const matchUser = match('/users/{id:int}');

assertEqual(
  matchUser('/users/42'),
  {
    match: true,
    params: {
      id: '42',
    },
  },
  'match() should match int route',
);

assertEqual(
  matchUser('/users/abc'),
  {
    match: false,
    params: null,
  },
  'match() should reject invalid int route',
);

const toFile = compile('/files/{*path}');

assertEqual(
  toFile({
    path: ['users', 'john', 'avatar.png'],
  }),
  '/files/users/john/avatar.png',
  'compile() should compile wildcard arrays',
);

const matchFile = match('/files/{*path}');

assertEqual(
  matchFile('/files/users/john/avatar.png'),
  {
    match: true,
    params: {
      path: 'users/john/avatar.png',
    },
  },
  'match() should match wildcard paths',
);

const toCustomDelimiter = compile('.tags.{*path}', {
  delimiter: '.',
});

assertEqual(
  toCustomDelimiter({
    path: ['frontend', 'typescript', 'routing'],
  }),
  '.tags.frontend.typescript.routing',
  'compile() should join wildcard arrays with custom delimiter',
);

const matchCustomDelimiter = match('.users.{id:int}', {
  delimiter: '.',
});

assertEqual(
  matchCustomDelimiter('.users.42'),
  {
    match: true,
    params: {
      id: '42',
    },
  },
  'match() should support custom delimiters',
);

const slug = createConstraint({
  parse: (paramName, value, params) => {
    if (typeof value !== 'string') {
      throw new Error(`Parameter "${paramName}" must be a string`);
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid slug`);
    }
  },
  verify: () => undefined,
  toRegExp: () => '[a-z0-9-]+',
});

registerConstraint('slug', slug);

const matchPost = match('/posts/{slug:slug}');
const toPost = compile('/posts/{slug:slug}');

assertEqual(
  matchPost('/posts/hello-world'),
  {
    match: true,
    params: {
      slug: 'hello-world',
    },
  },
  'custom constraints should work in match()',
);

assertEqual(
  matchPost('/posts/heiß'),
  {
    match: false,
    params: null,
  },
  'custom constraints should reject invalid unicode values in match()',
);

assertEqual(
  matchPost('/posts/Hello_World'),
  {
    match: false,
    params: null,
  },
  'custom constraints should reject invalid formatted values in match()',
);

assertEqual(
  toPost({
    slug: 'hello-world',
  }),
  '/posts/hello-world',
  'custom constraints should work in compile()',
);

assertThrows(
  () => {
    toPost({
      slug: 'heiß',
    });
  },
  'Parameter "slug" must be a valid slug',
  'custom constraints should reject invalid unicode values in compile()',
);

assertThrows(
  () => {
    toPost({
      slug: 'Hello_World',
    });
  },
  'Parameter "slug" must be a valid slug',
  'custom constraints should reject invalid formatted values in compile()',
);

resetConstraints();

console.log('Playground checks passed');
