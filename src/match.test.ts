import match from './match';
import {
  createConstraint,
  registerConstraint,
  resetConstraints,
  unregisterConstraint,
} from './constraints/registry';

type MatchOptions = NonNullable<Parameters<typeof match>[1]>;

type ExpectedParams = Record<string, string | string[] | undefined>;

type ExpectedMatch =
  | {
      match: true;
      path: string;
      params: ExpectedParams;
    }
  | {
      match: false;
      params: null;
    };

const expectRouteMatch = (
  pattern: string,
  path: string,
  expected: ExpectedMatch,
  options?: MatchOptions,
): void => {
  expect(match(pattern, options)(path)).toEqual(expected);
};

const expectSuccess = (
  pattern: string,
  path: string,
  params: ExpectedParams,
  options?: MatchOptions,
  matchedPath = path,
): void => {
  expectRouteMatch(
    pattern,
    path,
    {
      match: true,
      path: matchedPath,
      params,
    },
    options,
  );
};

const expectFailure = (pattern: string, path: string, options?: MatchOptions): void => {
  expectRouteMatch(
    pattern,
    path,
    {
      match: false,
      params: null,
    },
    options,
  );
};

describe('match', () => {
  afterEach(() => {
    resetConstraints();
    vi.resetModules();
  });

  it('should throw error on wrong route pattern', () => {
    expect(() => match('/{:hello}')).toThrow();
  });

  it('should return null when route pattern differs from href path', () => {
    expectFailure('/hello', '/hello/world');
  });

  describe('literal matching', () => {
    it('should match exact literal routes', () => {
      expectSuccess('/hello', '/hello', {});
      expectSuccess('/', '/', {});
    });

    it('should not match extra path segments when end is true by default', () => {
      expectFailure('/hello', '/hello/world');
    });

    it('should not match extra path segments when end is explicitly true', () => {
      expectFailure('/hello', '/hello/world', {
        end: true,
      });
    });
  });

  describe('end option', () => {
    it.each([
      {
        pattern: '/hello',
        path: '/hello',
        matchedPath: '/hello',
        params: {},
      },
      {
        pattern: '/hello',
        path: '/hello/world',
        matchedPath: '/hello',
        params: {},
      },
      {
        pattern: '/hello/',
        path: '/hello/world',
        matchedPath: '/hello/',
        params: {},
      },
      {
        pattern: '/hello/{name}',
        path: '/hello/world/profile',
        matchedPath: '/hello/world',
        params: {
          name: 'world',
        },
      },
    ])(
      'should match route prefix when end is false: $pattern against $path',
      ({ pattern, path, matchedPath, params }) => {
        expectSuccess(pattern, path, params, { end: false, sensitive: true }, matchedPath);
      },
    );

    it.each([
      {
        pattern: '/hello',
        path: '/helloworld',
      },
      {
        pattern: '/hello',
        path: '/hello-world',
      },
      {
        pattern: '/api',
        path: '/apix/users',
      },
    ])(
      'should not match partial literal segment when end is false: $pattern against $path',
      ({ pattern, path }) => {
        expectFailure(pattern, path, {
          end: false,
          sensitive: true,
        });
      },
    );

    it('should respect custom delimiter boundaries when end is false', () => {
      expectSuccess(
        '.hello',
        '.hello.world',
        {},
        {
          delimiter: '.',
          end: false,
          sensitive: true,
        },
        '.hello',
      );

      expectFailure('.hello', '.helloworld', {
        delimiter: '.',
        end: false,
        sensitive: true,
      });
    });
  });

  describe('sensitive option', () => {
    it('should be case-insensitive by default', () => {
      expectSuccess('/heLlo', '/hello', {});
      expectSuccess('/HELLO/{name}', '/hello/world', {
        name: 'world',
      });
    });

    it('should match case-insensitively when sensitive is false', () => {
      expectSuccess('/heLlo', '/hello', {}, { sensitive: false });

      expectSuccess(
        '/HELLO/{name}',
        '/hello/world',
        {
          name: 'world',
        },
        {
          sensitive: false,
        },
      );
    });

    it('should match case-sensitively when sensitive is true', () => {
      expectSuccess('/hello', '/hello', {}, { sensitive: true });

      expectFailure('/heLlo', '/hello', {
        sensitive: true,
      });

      expectFailure('/HELLO/{name}', '/hello/world', {
        sensitive: true,
      });
    });
  });

  describe('trailing option', () => {
    it('should allow trailing delimiter by default', () => {
      expectSuccess('/hello/{message}', '/hello/world/', {
        message: 'world',
      });
    });

    it('should allow trailing delimiter when trailing is true', () => {
      expectSuccess(
        '/hello/{message}',
        '/hello/world/',
        {
          message: 'world',
        },
        {
          trailing: true,
        },
      );
    });

    it('should reject trailing delimiter when trailing is false', () => {
      expectFailure('/hello/{message}', '/hello/world/', {
        trailing: false,
      });
    });

    it('should not use trailing option to allow extra path segments', () => {
      expectFailure('/hello/{message}', '/hello/world/extra', {
        trailing: true,
      });
    });

    it('should respect custom delimiter when trailing is true', () => {
      expectSuccess(
        '.hello.{message}',
        '.hello.world.',
        {
          message: 'world',
        },
        {
          delimiter: '.',
          trailing: true,
        },
      );
    });

    it('should reject custom trailing delimiter when trailing is false', () => {
      expectFailure('.hello.{message}', '.hello.world.', {
        delimiter: '.',
        trailing: false,
      });
    });
  });

  describe('wildcardFormat option', () => {
    it('should return wildcard params as string by default', () => {
      expectSuccess('/hello/{*path}', '/hello/new/world', {
        path: 'new/world',
      });
    });

    it('should return wildcard params as string when wildcardFormat is string', () => {
      expectSuccess(
        '/hello/{*path}',
        '/hello/foo/bar',
        {
          path: 'foo/bar',
        },
        {
          wildcardFormat: 'string',
        },
      );
    });

    it('should return wildcard params as array when wildcardFormat is array', () => {
      expectSuccess(
        '/hello/{*path}',
        '/hello/foo/bar',
        {
          path: ['foo', 'bar'],
        },
        {
          wildcardFormat: 'array',
        },
      );
    });

    it('should not affect non-wildcard route matching', () => {
      expectFailure('/hello', '/hello/world', {
        end: true,
        wildcardFormat: 'array',
      });
    });

    it('should return undefined for omitted optional wildcard params', () => {
      expectSuccess(
        '/hello/{*path?}',
        '/hello',
        {
          path: undefined,
        },
        {
          wildcardFormat: 'array',
        },
      );
    });

    it('should split wildcard params using custom delimiter', () => {
      expectSuccess(
        '.hello.{*path}',
        '.hello.foo.bar',
        {
          path: ['foo', 'bar'],
        },
        {
          delimiter: '.',
          wildcardFormat: 'array',
        },
      );
    });

    it('should support wildcardFormat array with end false', () => {
      expectSuccess(
        '/hello/{*path}',
        '/hello/foo/bar',
        {
          path: ['foo', 'bar'],
        },
        {
          end: false,
          sensitive: true,
          wildcardFormat: 'array',
        },
      );
    });
  });

  describe('decode option', () => {
    it('should keep params encoded by default', () => {
      const encodedName = encodeURIComponent('John Gonçalves');

      expectSuccess('/hello/{name}', `/hello/${encodedName}`, {
        name: encodedName,
      });
    });

    it('should keep params encoded when decode is false', () => {
      const encodedName = encodeURIComponent('John Gonçalves');

      expectSuccess(
        '/hello/{name}',
        `/hello/${encodedName}`,
        {
          name: encodedName,
        },
        {
          decode: false,
        },
      );
    });

    it('should decode params when decode is true', () => {
      const encodedName = encodeURIComponent('John Gonçalves');

      expectSuccess(
        '/hello/{name}',
        `/hello/${encodedName}`,
        {
          name: 'John Gonçalves',
        },
        {
          decode: true,
        },
      );
    });

    it('should use a custom decoder when decode is a function', () => {
      expectSuccess(
        '/hello/{name}',
        '/hello/John-Doe',
        {
          name: 'John Doe',
        },
        {
          decode: (value) => value.replaceAll('-', ' '),
        },
      );
    });

    it('should throw decode errors even when strict is false', () => {
      expect(() => {
        match('/hello/{name}', {
          decode: true,
          strict: false,
        })('/hello/%E0%A4%A');
      }).toThrow(URIError);
    });

    it('should throw custom decoder errors even when strict is false', () => {
      expect(() => {
        match('/hello/{name}', {
          decode: () => {
            throw new Error('custom decode failure');
          },
          strict: false,
        })('/hello/world');
      }).toThrow('custom decode failure');
    });

    it('should decode wildcard string params when decode is true', () => {
      expectSuccess(
        '/files/{*path}',
        '/files/a%20b/c%20d',
        {
          path: 'a b/c d',
        },
        {
          decode: true,
        },
      );
    });

    it('should decode wildcard array params segment by segment', () => {
      expectSuccess(
        '/files/{*path}',
        '/files/a%2Fb/c%20d',
        {
          path: ['a/b', 'c d'],
        },
        {
          decode: true,
          wildcardFormat: 'array',
        },
      );
    });

    it('should decode wildcard array params segment by segment with a custom delimiter', () => {
      expectSuccess(
        '.files.{*path}',
        '.files.a%2Eb.c%20d',
        {
          path: ['a.b', 'c d'],
        },
        {
          delimiter: '.',
          decode: true,
          wildcardFormat: 'array',
        },
      );
    });

    it('should preserve encoded wildcard array params when decode is false', () => {
      expectSuccess(
        '/files/{*path}',
        '/files/a%2Fb/c%20d',
        {
          path: ['a%2Fb', 'c%20d'],
        },
        {
          decode: false,
          wildcardFormat: 'array',
        },
      );
    });

    it('should validate constraints against decoded values', () => {
      const decodedOnly = createConstraint({
        parse: (param, value) => {
          if (value !== 'foo/bar') {
            throw new Error(`Parameter "${param}" must be decoded`);
          }
        },
        verify: () => undefined,
        toRegExp: () => '[^/]+',
      });

      registerConstraint('decodedOnly', decodedOnly);

      expectSuccess(
        '/files/{path:decodedOnly}',
        '/files/foo%2Fbar',
        {
          path: 'foo/bar',
        },
        {
          decode: true,
        },
      );
    });

    it('should return failed match when decoded constraint value fails and strict is false', () => {
      const decodedOnly = createConstraint({
        parse: (param, value) => {
          if (value !== 'foo/bar') {
            throw new Error(`Parameter "${param}" must be decoded`);
          }
        },
        verify: () => undefined,
        toRegExp: () => '[^/]+',
      });

      registerConstraint('decodedOnly', decodedOnly);

      expectFailure('/files/{path:decodedOnly}', '/files/foo%20bar', {
        decode: true,
        strict: false,
      });
    });

    it('should throw when decoded constraint value fails and strict is true', () => {
      const decodedOnly = createConstraint({
        parse: (param, value) => {
          if (value !== 'foo/bar') {
            throw new Error(`Parameter "${param}" must be decoded`);
          }
        },
        verify: () => undefined,
        toRegExp: () => '[^/]+',
      });

      registerConstraint('decodedOnly', decodedOnly);

      expect(() => {
        match('/files/{path:decodedOnly}', {
          decode: true,
          strict: true,
        })('/files/foo%20bar');
      }).toThrow('Parameter "path" must be decoded');
    });
  });

  describe('option combinations', () => {
    it.each([
      {
        name: 'case-insensitive prefix match without trailing slash',
        pattern: '/API',
        path: '/api/users',
        options: {
          end: false,
          sensitive: false,
        },
        expected: {
          match: true,
          path: '/api',
          params: {},
        },
      },
      {
        name: 'case-sensitive prefix mismatch',
        pattern: '/API',
        path: '/api/users',
        options: {
          end: false,
          sensitive: true,
        },
        expected: {
          match: false,
          params: null,
        },
      },
      {
        name: 'custom delimiter prefix match',
        pattern: '.api',
        path: '.api.users',
        options: {
          delimiter: '.',
          end: false,
          sensitive: true,
        },
        expected: {
          match: true,
          path: '.api',
          params: {},
        },
      },
      {
        name: 'custom delimiter wildcard array',
        pattern: '.api.{*path}',
        path: '.api.users.active',
        options: {
          delimiter: '.',
          wildcardFormat: 'array',
        },
        expected: {
          match: true,
          path: '.api.users.active',
          params: {
            path: ['users', 'active'],
          },
        },
      },
      {
        name: 'trailing false with exact match rejects trailing delimiter',
        pattern: '/api/{version}',
        path: '/api/v1/',
        options: {
          trailing: false,
        },
        expected: {
          match: false,
          params: null,
        },
      },
      {
        name: 'trailing true with exact match accepts trailing delimiter',
        pattern: '/api/{version}',
        path: '/api/v1/',
        options: {
          trailing: true,
        },
        expected: {
          match: true,
          path: '/api/v1/',
          params: {
            version: 'v1',
          },
        },
      },
      {
        name: 'decoded case-insensitive prefix param match',
        pattern: '/API/{name}',
        path: '/api/John%20Doe/profile',
        options: {
          decode: true,
          end: false,
          sensitive: false,
        },
        expected: {
          match: true,
          path: '/api/John%20Doe',
          params: {
            name: 'John Doe',
          },
        },
      },
      {
        name: 'decoded wildcard array with custom delimiter',
        pattern: '.api.{*path}',
        path: '.api.users%2Eactive.profile',
        options: {
          delimiter: '.',
          decode: true,
          wildcardFormat: 'array',
        },
        expected: {
          match: true,
          path: '.api.users%2Eactive.profile',
          params: {
            path: ['users.active', 'profile'],
          },
        },
      },
    ] as const)('$name', ({ pattern, path, options, expected }) => {
      expect(match(pattern, options)(path)).toEqual(expected);
    });
  });

  it('should not match when missing required parameter', () => {
    expectFailure('/hello/{message}', '/hello');
  });

  it('should not match even when all parameters are optional and literal path differs', () => {
    expectFailure('/placeholder/{view:list(foo|bar)?}/{id?}', '/no-match-at-all');
  });

  it('should match optional parameters before trailing delimiter', () => {
    expectSuccess('/say/after/{message?}/{id?}', '/say/after/', {});
  });

  it('should match optional constrained parameter', () => {
    expectSuccess('/{lang?}/articles/{id:int?}', '/en/articles/42', {
      lang: 'en',
      id: '42',
    });

    expectFailure('/{lang?}/articles/{id:int?}', '/en/articles/foo');
  });

  it('should match optional constrained parameter before trailing delimiter', () => {
    expectSuccess(
      '/{lang?}/my-content/shorts/{privacy:list(free|premium)?}/{shortsId?}',
      '/en/my-content/shorts/',
      {
        lang: 'en',
      },
    );
  });

  it('should match optional parameter with chained constraints', () => {
    expectSuccess('/product/{slug:minlength(2):maxlength(11)?}', '/product/lorem-ipsum', {
      slug: 'lorem-ipsum',
    });

    expectSuccess('/product/{slug:minlength(2):maxlength(11)?}', '/product', {});
  });

  it('should throw built-in constraint validation error when strict mode is enabled', () => {
    const brokenInt = createConstraint({
      parse: (param) => {
        throw new Error(`Parameter "${param}" failed runtime validation`);
      },
      verify: () => undefined,
      toRegExp: () => '\\d+',
    });

    registerConstraint('int', brokenInt);

    expect(() => {
      match('/users/{id:int}', { strict: true })('/users/123');
    }).toThrow('Parameter "id" failed runtime validation');
  });

  it('should not throw built-in constraint validation error when strict mode is disabled', () => {
    const brokenInt = createConstraint({
      parse: (param: string) => {
        throw new Error(`Parameter "${param}" failed runtime validation`);
      },
      verify: () => undefined,
      toRegExp: () => '\\d+',
    });

    registerConstraint('int', brokenInt);

    expectFailure('/users/{id:int}', '/users/123');
  });

  it('should not match when constraint is not registered', () => {
    expectFailure('/users/{id:notRegistered}', '/users/abc');
  });

  it('should not match when wildcard constraint is not registered', () => {
    expectFailure('/files/{*path:notRegistered}', '/files/docs/guides/readme');
  });

  it('should throw when constraint is not registered and strict mode is enabled', () => {
    expect(() => {
      match('/users/{id:notRegistered}', { strict: true })('/users/abc');
    }).toThrow("[Match] Constraint 'notRegistered' declared for 'id' parameter is not registered.");
  });

  it('should throw when wildcard constraint is not registered and strict mode is enabled', () => {
    expect(() => {
      match('/files/{*path:notRegistered}', { strict: true })('/files/docs/guides/readme');
    }).toThrow(
      "[Match] Constraint 'notRegistered' declared for 'path' parameter is not registered.",
    );
  });

  it('should fallback to the default parameter pattern when registered constraint returns empty regexp', () => {
    const emptyRegExpConstraint = createConstraint({
      parse: () => undefined,
      verify: () => undefined,
      toRegExp: () => '',
    });

    registerConstraint('empty-regexp', emptyRegExpConstraint);

    expectSuccess('/users/{id:empty-regexp}', '/users/abc', {
      id: 'abc',
    });
  });

  it('should match optional parameter without previous literal segment', () => {
    expectSuccess('{id?}', 'abc', {
      id: 'abc',
    });
  });

  it('should match missing optional parameter without previous literal segment', () => {
    expectSuccess('{id?}', '', {
      id: undefined,
    });
  });

  it.each([
    {
      pattern: '/hello/{say}',
      path: '/hello/world',
      matches: {
        match: true,
        path: '/hello/world',
        params: {
          say: 'world',
        },
      },
    },
    {
      pattern: '/',
      path: '/',
      matches: {
        match: true,
        path: '/',
        params: {},
      },
    },
    {
      pattern: '/page/settings/{number:range(1,100)?}',
      path: '/page/settings/50',
      matches: {
        match: true,
        path: '/page/settings/50',
        params: {
          number: '50',
        },
      },
    },
    {
      pattern: '/page/settings/{number:regex([0-9]+)?}',
      path: '/page/settings/50',
      matches: {
        match: true,
        path: '/page/settings/50',
        params: {
          number: '50',
        },
      },
    },
    {
      pattern: '/page/settings/{number:regex(([0-9]+))?}',
      path: '/page/settings/50',
      matches: {
        match: true,
        path: '/page/settings/50',
        params: {
          number: '50',
        },
      },
    },
    {
      pattern:
        '/page/settings/{id:regex(^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$)?}',
      path: '/page/settings/d3aa88e2-c754-41e0-8ba6-4198a34aa0a2',
      matches: {
        match: true,
        path: '/page/settings/d3aa88e2-c754-41e0-8ba6-4198a34aa0a2',
        params: {
          id: 'd3aa88e2-c754-41e0-8ba6-4198a34aa0a2',
        },
      },
    },
    {
      pattern: '/page/settings/{number:range(1,100)?}',
      path: '/page/settings',
      matches: {
        match: true,
        path: '/page/settings',
        params: {},
      },
    },
    {
      pattern: '/products/{id:int}',
      path: '/products/42',
      matches: {
        match: true,
        path: '/products/42',
        params: { id: '42' },
      },
    },
    {
      pattern: '/products/{id:min(1)}',
      path: '/products/42',
      matches: {
        match: true,
        path: '/products/42',
        params: { id: '42' },
      },
    },
    {
      pattern: '/products/{value:decimal}',
      path: '/products/9.99',
      matches: {
        match: true,
        path: '/products/9.99',
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/products/{value:decimal:max(10)}',
      path: '/products/9.99',
      matches: {
        match: true,
        path: '/products/9.99',
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/products/{value:decimal:min(1)}',
      path: '/products/9.99',
      matches: {
        match: true,
        path: '/products/9.99',
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/products/{value:decimal:min(1):max(10)}',
      path: '/products/9.99',
      matches: {
        match: true,
        path: '/products/9.99',
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/product/{slug:minlength(2)}',
      path: '/product/lorem-ipsum',
      matches: {
        match: true,
        path: '/product/lorem-ipsum',
        params: { slug: 'lorem-ipsum' },
      },
    },
    {
      pattern: '/product/{slug:minlength(2):maxlength(11)}',
      path: '/product/lorem-ipsum',
      matches: {
        match: true,
        path: '/product/lorem-ipsum',
        params: { slug: 'lorem-ipsum' },
      },
    },
    {
      pattern: '/users/{id:uuid}',
      path: '/users/7d444840-9dc0-11d1-b245-5ffdce74fad2',
      matches: {
        match: true,
        path: '/users/7d444840-9dc0-11d1-b245-5ffdce74fad2',
        params: { id: '7d444840-9dc0-11d1-b245-5ffdce74fad2' },
      },
    },
    {
      pattern: '/search/{type:list(view|expanded|details)}',
      path: '/search/view',
      matches: {
        match: true,
        path: '/search/view',
        params: {
          type: 'view',
        },
      },
    },
    {
      pattern: '/search/{*wildcard}',
      path: '/search/anything/goes/here',
      matches: {
        match: true,
        path: '/search/anything/goes/here',
        params: {
          wildcard: 'anything/goes/here',
        },
      },
    },
    {
      pattern: '/search/{*wildcard?}',
      path: '/search',
      matches: {
        match: true,
        path: '/search',
        params: {
          wildcard: undefined,
        },
      },
    },
    {
      pattern: '/search/{name}/{lastname?}',
      path: '/search',
      matches: {
        match: false,
        params: null,
      },
    },
    {
      pattern: '/search/{page?}/{term?}',
      path: '/search',
      matches: {
        match: true,
        path: '/search',
        params: {
          page: undefined,
          term: undefined,
        },
      },
    },
    {
      pattern: '/search/{page?}/{term?}',
      path: '/search/videos',
      matches: {
        match: true,
        path: '/search/videos',
        params: {
          page: 'videos',
          term: undefined,
        },
      },
    },
    {
      pattern: '/search/{page?}/{term?}',
      path: '/search/videos/newest',
      matches: {
        match: true,
        path: '/search/videos/newest',
        params: {
          page: 'videos',
          term: 'newest',
        },
      },
    },
  ])('should match route pattern $pattern', ({ pattern, path, matches }) => {
    expect(match(pattern)(path)).toEqual(matches);
  });

  it.each([
    {
      pattern: '.hello.{say}',
      path: '.hello.world',
      matches: {
        match: true,
        path: '.hello.world',
        params: {
          say: 'world',
        },
      },
    },
    {
      pattern: '.page.settings.{number:range(1,100)?}',
      path: '.page.settings.50',
      matches: {
        match: true,
        path: '.page.settings.50',
        params: {
          number: '50',
        },
      },
    },
    {
      pattern: '.page.settings.{number:range(1,100)?}',
      path: '.page.settings',
      matches: {
        match: true,
        path: '.page.settings',
        params: {},
      },
    },
    {
      pattern: '.search.{type:list(view|expanded|details)}',
      path: '.search.view',
      matches: {
        match: true,
        path: '.search.view',
        params: {
          type: 'view',
        },
      },
    },
    {
      pattern: '.search.{*wildcard}',
      path: '.search.anything.goes.here',
      matches: {
        match: true,
        path: '.search.anything.goes.here',
        params: {
          wildcard: 'anything.goes.here',
        },
      },
    },
    {
      pattern: '.search.{*wildcard?}',
      path: '.search',
      matches: {
        match: true,
        path: '.search',
        params: {
          wildcard: undefined,
        },
      },
    },
  ])('should match route pattern $pattern with custom delimiter', ({ pattern, path, matches }) => {
    expect(match(pattern, { delimiter: '.' })(path)).toEqual(matches);
  });

  it.each([
    {
      pattern: '/hello/{say}',
      path: `/hello/${encodeURIComponent('joão')}`,
      matches: {
        match: true,
        path: `/hello/${encodeURIComponent('joão')}`,
        params: {
          say: encodeURIComponent('joão'),
        },
      },
    },
    {
      pattern: '/path/{path}',
      path: `/path/${encodeURIComponent('foo/bar')}`,
      matches: {
        match: true,
        path: `/path/${encodeURIComponent('foo/bar')}`,
        params: {
          path: encodeURIComponent('foo/bar'),
        },
      },
    },
  ])(
    'should match route pattern with encoded params without decoding by default',
    ({ pattern, path, matches }) => {
      expect(match(pattern)(path)).toEqual(matches);
    },
  );

  describe('custom constraints', () => {
    const uuidish = createConstraint({
      parse: (param, value) => {
        if (typeof value !== 'string' || !/^[a-f0-9]{8}$/.test(value)) {
          throw new Error(`Parameter "${param}" must be uuidish`);
        }
      },
      verify: () => undefined,
      toRegExp: () => '[a-f0-9]{8}',
    });

    afterEach(() => {
      unregisterConstraint('uuidish');
    });

    it('should match custom registered constraint', () => {
      registerConstraint('uuidish', uuidish);

      expectSuccess('/users/{id:uuidish}', '/users/a1b2c3d4', {
        id: 'a1b2c3d4',
      });
    });

    it('should not match custom registered constraint when regexp fails', () => {
      registerConstraint('uuidish', uuidish);

      expectFailure('/users/{id:uuidish}', '/users/not-valid');
    });

    it('should not match custom registered constraint when validation fails after regexp match', () => {
      const constraint = createConstraint({
        parse: () => {
          throw new Error('forced failure');
        },
        verify: () => undefined,
        toRegExp: () => '[a-z]+',
      });

      registerConstraint('uuidish', constraint);

      expectFailure('/users/{id:uuidish}', '/users/abcdef');
    });

    it('should throw custom constraint validation error when strict mode is enabled', () => {
      const constraint = createConstraint({
        parse: (param: string, value: string | number | boolean | undefined) => {
          if (value !== 'valid') {
            throw new Error(`Parameter "${param}" must be valid`);
          }
        },
        verify: () => undefined,
        toRegExp: () => '[a-z]+',
      });

      registerConstraint('uuidish', constraint);

      expect(() => {
        match('/users/{id:uuidish}', { strict: true })('/users/invalid');
      }).toThrow('Parameter "id" must be valid');
    });

    it('should not throw custom constraint validation error when strict mode is disabled', () => {
      const constraint = createConstraint({
        parse: (param, value) => {
          if (value !== 'valid') {
            throw new Error(`Parameter "${param}" must be valid`);
          }
        },
        verify: () => undefined,
        toRegExp: () => '[a-z]+',
      });

      registerConstraint('uuidish', constraint);

      expectFailure('/users/{id:uuidish}', '/users/invalid');
    });

    it('should match custom constraint when strict mode is enabled and value is valid', () => {
      const constraint = createConstraint({
        parse: (param, value) => {
          if (value !== 'valid') {
            throw new Error(`Parameter "${param}" must be valid`);
          }
        },
        verify: () => undefined,
        toRegExp: () => '[a-z]+',
      });

      registerConstraint('uuidish', constraint);

      expectSuccess(
        '/users/{id:uuidish}',
        '/users/valid',
        {
          id: 'valid',
        },
        {
          strict: true,
        },
      );
    });

    it('should not throw in strict mode when regexp does not match', () => {
      registerConstraint('uuidish', uuidish);

      expectFailure('/users/{id:uuidish}', '/users/not-valid', {
        strict: true,
      });
    });

    it('should handle optional custom constrained params when missing', () => {
      registerConstraint('uuidish', uuidish);

      expectSuccess('/users/{id:uuidish?}', '/users', {
        id: undefined,
      });
    });

    it('should handle optional custom constrained params when present', () => {
      registerConstraint('uuidish', uuidish);

      expectSuccess('/users/{id:uuidish?}', '/users/a1b2c3d4', {
        id: 'a1b2c3d4',
      });
    });
  });

  describe('defensive branches', () => {
    it('should throw when duplicate parameter names are declared', () => {
      expect(() => match('/users/{id}/posts/{id}')).toThrow(
        /Duplicate parameter 'id' found in the route/,
      );
    });
  });
});
