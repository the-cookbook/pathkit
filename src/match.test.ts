import match from './match';
import {
  createConstraint,
  registerConstraint,
  resetConstraints,
  unregisterConstraint,
} from './constraints/registry';

describe('match', () => {
  afterEach(() => {
    unregisterConstraint('int');
    unregisterConstraint('uuidish');
    unregisterConstraint('empty-regexp');
    resetConstraints();
    vi.doUnmock('./tokenize');
    vi.doUnmock('./utils/segment-filters');
    vi.resetModules();
  });

  it('should throw error on wrong route pattern', () => {
    expect(() => match('/{:hello}')).toThrow();
  });

  it('should return null when route pattern differs from href path', () => {
    expect(match('/hello')('/hello/world')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should match literal segment(s)', () => {
    expect(match('/hello')('/hello')).toEqual({
      match: true,
      params: {},
    });
  });

  it('should not match when missing required parameter', () => {
    expect(match('/hello/{message}')('/hello')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should not match even when all parameters are optional and literal path differs', () => {
    expect(match('/placeholder/{view:list(foo|bar)?}/{id?}')('/no-match-at-all')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should not match when trailing options is disabled', () => {
    expect(match('/hello/{message}', { trailing: false })('/hello/world/')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should match when trailing options is enabled', () => {
    expect(match('/hello/{message}')('/hello/world/')).toEqual({
      match: true,
      params: {
        message: 'world',
      },
    });
  });

  it('should match optional parameters before trailing delimiter', () => {
    expect(match('/say/after/{message?}/{id?}')('/say/after/')).toEqual({
      match: true,
      params: {},
    });
  });

  it('should match optional constrained parameter', () => {
    expect(match('/{lang?}/articles/{id:int?}')('/en/articles/42')).toEqual({
      match: true,
      params: {
        lang: 'en',
        id: '42',
      },
    });

    expect(match('/{lang?}/articles/{id:int?}')('/en/articles/foo')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should match optional constrained parameter before trailing delimiter', () => {
    expect(
      match('/{lang?}/my-content/shorts/{privacy:list(free|premium)?}/{shortsId?}')(
        '/en/my-content/shorts/',
      ),
    ).toEqual({
      match: true,
      params: {
        lang: 'en',
      },
    });
  });

  it('should match optional parameter with chained constraints', () => {
    expect(match('/product/{slug:minlength(2):maxlength(11)?}')('/product/lorem-ipsum')).toEqual({
      match: true,
      params: { slug: 'lorem-ipsum' },
    });

    expect(match('/product/{slug:minlength(2):maxlength(11)?}')('/product')).toEqual({
      match: true,
      params: {},
    });
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

    expect(match('/users/{id:int}')('/users/123')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should not match when constraint is not registered', () => {
    expect(match('/users/{id:notRegistered}')('/users/abc')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should not match when wildcard constraint is not registered', () => {
    expect(match('/files/{*path:notRegistered}')('/files/docs/guides/readme')).toEqual({
      match: false,
      params: null,
    });
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

    expect(match('/users/{id:empty-regexp}')('/users/abc')).toEqual({
      match: true,
      params: {
        id: 'abc',
      },
    });
  });

  it('should match optional parameter without previous literal segment', () => {
    expect(match('{id?}')('abc')).toEqual({
      match: true,
      params: {
        id: 'abc',
      },
    });
  });

  it('should match missing optional parameter without previous literal segment', () => {
    expect(match('{id?}')('')).toEqual({
      match: true,
      params: {
        id: undefined,
      },
    });
  });

  it.each([
    {
      pattern: '/hello/{say}',
      path: '/hello/world',
      matches: {
        match: true,
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
        params: {},
      },
    },
    {
      pattern: '/page/settings/{number:range(1,100)?}',
      path: '/page/settings/50',
      matches: {
        match: true,
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
        params: {},
      },
    },
    {
      pattern: '/products/{id:int}',
      path: '/products/42',
      matches: {
        match: true,
        params: { id: '42' },
      },
    },
    {
      pattern: '/products/{id:min(1)}',
      path: '/products/42',
      matches: {
        match: true,
        params: { id: '42' },
      },
    },
    {
      pattern: '/products/{value:decimal}',
      path: '/products/9.99',
      matches: {
        match: true,
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/products/{value:decimal:max(10)}',
      path: '/products/9.99',
      matches: {
        match: true,
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/products/{value:decimal:min(1)}',
      path: '/products/9.99',
      matches: {
        match: true,
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/products/{value:decimal:min(1):max(10)}',
      path: '/products/9.99',
      matches: {
        match: true,
        params: { value: '9.99' },
      },
    },
    {
      pattern: '/product/{slug:minlength(2)}',
      path: '/product/lorem-ipsum',
      matches: {
        match: true,
        params: { slug: 'lorem-ipsum' },
      },
    },
    {
      pattern: '/product/{slug:minlength(2):maxlength(11)}',
      path: '/product/lorem-ipsum',
      matches: {
        match: true,
        params: { slug: 'lorem-ipsum' },
      },
    },
    {
      pattern: '/users/{id:uuid}',
      path: '/users/7d444840-9dc0-11d1-b245-5ffdce74fad2',
      matches: {
        match: true,
        params: { id: '7d444840-9dc0-11d1-b245-5ffdce74fad2' },
      },
    },
    {
      pattern: '/search/{type:list(view|expanded|details)}',
      path: '/search/view',
      matches: {
        match: true,
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
        params: {},
      },
    },
    {
      pattern: '.search.{type:list(view|expanded|details)}',
      path: '.search.view',
      matches: {
        match: true,
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
        params: {
          path: encodeURIComponent('foo/bar'),
        },
      },
    },
  ])('should match route pattern with encoded params', ({ pattern, path, matches }) => {
    expect(match(pattern)(path)).toEqual(matches);
  });

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

      expect(match('/users/{id:uuidish}')('/users/a1b2c3d4')).toEqual({
        match: true,
        params: {
          id: 'a1b2c3d4',
        },
      });
    });

    it('should not match custom registered constraint when regexp fails', () => {
      registerConstraint('uuidish', uuidish);

      expect(match('/users/{id:uuidish}')('/users/not-valid')).toEqual({
        match: false,
        params: null,
      });
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

      expect(match('/users/{id:uuidish}')('/users/abcdef')).toEqual({
        match: false,
        params: null,
      });
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

      expect(match('/users/{id:uuidish}')('/users/invalid')).toEqual({
        match: false,
        params: null,
      });
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

      expect(match('/users/{id:uuidish}', { strict: true })('/users/valid')).toEqual({
        match: true,
        params: {
          id: 'valid',
        },
      });
    });

    it('should not throw in strict mode when regexp does not match', () => {
      registerConstraint('uuidish', uuidish);

      expect(match('/users/{id:uuidish}', { strict: true })('/users/not-valid')).toEqual({
        match: false,
        params: null,
      });
    });

    it('should handle optional custom constrained params when missing', () => {
      registerConstraint('uuidish', uuidish);

      expect(match('/users/{id:uuidish?}')('/users')).toEqual({
        match: true,
        params: {
          id: undefined,
        },
      });
    });

    it('should handle optional custom constrained params when present', () => {
      registerConstraint('uuidish', uuidish);

      expect(match('/users/{id:uuidish?}')('/users/a1b2c3d4')).toEqual({
        match: true,
        params: {
          id: 'a1b2c3d4',
        },
      });
    });
  });

  describe('defensive branches', () => {
    it('should continue when a matched param name has no corresponding parameter segment', async () => {
      let parameterFilterCalls = 0;

      vi.doMock('./tokenize', () => ({
        default: vi.fn(() => [
          {
            type: 'parameter',
            name: 'id',
            wildcard: false,
            optional: false,
            constraints: [],
          },
        ]),
      }));

      vi.doMock('./utils/segment-filters', () => ({
        isLiteralToken: vi.fn(() => false),
        isParameterToken: vi.fn(() => {
          parameterFilterCalls += 1;

          return parameterFilterCalls > 1;
        }),
      }));

      const { default: mockedMatch } = await import('./match');

      expect(mockedMatch('/ignored')('abc')).toEqual({
        match: true,
        params: {},
      });
    });
  });
});
