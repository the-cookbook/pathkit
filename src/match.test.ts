import match from './match';
import { registerConstraint, unregisterConstraint } from './constraints/registry';
import type { ConstraintValidation } from './contracts';

describe('match', () => {
  afterEach(() => {
    unregisterConstraint('int');
  });

  it('should throw error on wrong route pattern', () => {
    expect(() => match('/{:hello}')).toThrow();
  });

  it('should return null when route pattern differs from href path', () => {
    expect(match('/hello')('/hello/world')).toEqual({ match: false, params: null });
  });

  it('should not match literal segment(s)', () => {
    expect(match('/hello')('/hello')).toEqual({ match: true, params: {} });
  });

  it('should not match when missing required parameter', () => {
    expect(match('/hello/{message}')('/hello')).toEqual({ match: false, params: null });
  });

  it('should not match even when all parameters are optional', () => {
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
      params: { message: 'world' },
    });

    expect(match(`/say/after/{message?}/{id?}`)('/say/after/')).toEqual({
      match: true,
      params: {},
    });

    expect(
      match(`/{lang?}/my-content/shorts/{privacy:list(free|premium)?}/{shortsId?}`)(
        '/en/my-content/shorts/',
      ),
    ).toEqual({
      match: true,
      params: { lang: 'en' },
    });
  });

  it('should throw built-in constraint validation error when strict mode is enabled', () => {
    const brokenInt: ConstraintValidation = Object.assign(
      (param: string) => {
        throw new Error(`Parameter "${param}" failed runtime validation`);
      },
      {
        verify: () => undefined,
        toRegExp: () => '\\d+',
      },
    );

    registerConstraint('int', brokenInt);

    expect(() => {
      match('/users/{id:int}', { strict: true })('/users/123');
    }).toThrow('Parameter "id" failed runtime validation');
  });

  it('should not throw built-in constraint validation error when strict mode is disabled', () => {
    const brokenInt: ConstraintValidation = Object.assign(
      (param: string) => {
        throw new Error(`Parameter "${param}" failed runtime validation`);
      },
      {
        verify: () => undefined,
        toRegExp: () => '\\d+',
      },
    );

    registerConstraint('int', brokenInt);

    expect(match('/users/{id:int}')('/users/123')).toEqual({
      match: false,
      params: null,
    });
  });

  it.each([
    {
      pattern: '/hello/{say}',
      path: '/hello/world',
      matches: { match: true, params: { say: 'world' } },
    },
    {
      pattern: '/',
      path: '/',
      matches: { match: true, params: {} },
    },
    {
      pattern: '/page/settings/{number:range(1,100)?}',
      path: '/page/settings/50',
      matches: { match: true, params: { number: '50' } },
    },
    {
      pattern: '/page/settings/{number:regex(\\d+)?}',
      path: '/page/settings/50',
      matches: { match: true, params: { number: '50' } },
    },
    {
      pattern: '/page/settings/{number:regex(([0-9]+))?}',
      path: '/page/settings/50',
      matches: { match: true, params: { number: '50' } },
    },
    {
      pattern:
        '/page/settings/{id:regex(^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$)?}',
      path: '/page/settings/d3aa88e2-c754-41e0-8ba6-4198a34aa0a2',
      matches: { match: true, params: { id: 'd3aa88e2-c754-41e0-8ba6-4198a34aa0a2' } },
    },
    {
      pattern: '/page/settings/{number:range(1,100)?}',
      path: '/page/settings',
      matches: { match: true, params: {} },
    },
    {
      pattern: '/search/{type:list(view|expanded|details)}',
      path: '/search/view',
      matches: { match: true, params: { type: 'view' } },
    },
    {
      pattern: '/search/{*wildcard}',
      path: '/search/anything/goes/here',
      matches: { match: true, params: { wildcard: 'anything/goes/here' } },
    },
    {
      pattern: '/search/{*wildcard?}',
      path: '/search',
      matches: { match: true, params: { wildcard: undefined } },
    },
    {
      pattern: '/search/{name}/{lastname?}',
      path: '/search',
      matches: { match: false, params: null },
    },
    {
      pattern: '/search/{page?}/{term?}',
      path: '/search',
      matches: { match: true, params: { page: undefined, term: undefined } },
    },
    {
      pattern: '/search/{page?}/{term?}',
      path: '/search/videos',
      matches: { match: true, params: { page: 'videos', term: undefined } },
    },
    {
      pattern: '/search/{page?}/{term?}',
      path: '/search/videos/newest',
      matches: { match: true, params: { page: 'videos', term: 'newest' } },
    },
  ])('should match route pattern $pattern', ({ pattern, path, matches }) => {
    expect(match(pattern)(path)).toEqual(matches);
  });

  it.each([
    {
      pattern: '.hello.{say}',
      path: '.hello.world',
      matches: { match: true, params: { say: 'world' } },
    },
    {
      pattern: '.page.settings.{number:range(1,100)?}',
      path: '.page.settings.50',
      matches: { match: true, params: { number: '50' } },
    },
    {
      pattern: '.page.settings.{number:range(1,100)?}',
      path: '.page.settings',
      matches: { match: true, params: {} },
    },
    {
      pattern: '.search.{type:list(view|expanded|details)}',
      path: '.search.view',
      matches: { match: true, params: { type: 'view' } },
    },
    {
      pattern: '.search.{*wildcard}',
      path: '.search.anything.goes.here',
      matches: { match: true, params: { wildcard: 'anything.goes.here' } },
    },
    {
      pattern: '.search.{*wildcard?}',
      path: '.search',
      matches: { match: true, params: { wildcard: undefined } },
    },
  ])('should match route pattern $pattern with custom delimiter', ({ pattern, path, matches }) => {
    expect(match(pattern, { delimiter: '.' })(path)).toEqual(matches);
  });

  it.each([
    {
      pattern: '/hello/{say}',
      path: `/hello/${encodeURIComponent('joão')}`,
      matches: { match: true, params: { say: encodeURIComponent('joão') } },
    },
    {
      pattern: '/path/{path}',
      path: `/path/${encodeURIComponent('foo/bar')}`,
      matches: { match: true, params: { path: encodeURIComponent('foo/bar') } },
    },
  ])('should match route pattern with encoded params', ({ pattern, path, matches }) => {
    expect(match(pattern)(path)).toEqual(matches);
  });

  describe('custom constraints', () => {
    const uuidish: ConstraintValidation = Object.assign(
      (param: string, value: string | number | boolean | undefined) => {
        if (typeof value !== 'string' || !/^[a-f0-9]{8}$/.test(value)) {
          throw new Error(`Parameter "${param}" must be uuidish`);
        }
      },
      {
        verify: () => undefined,
        toRegExp: () => '[a-f0-9]{8}',
      },
    );

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
      const constraint: ConstraintValidation = Object.assign(
        () => {
          throw new Error('forced failure');
        },
        {
          verify: () => undefined,
          toRegExp: () => '[a-z]+',
        },
      );

      registerConstraint('uuidish', constraint);

      expect(match('/users/{id:uuidish}')('/users/abcdef')).toEqual({
        match: false,
        params: null,
      });
    });

    it('should throw custom constraint validation error when strict mode is enabled', () => {
      const constraint: ConstraintValidation = Object.assign(
        (param: string, value: string | number | boolean | undefined) => {
          if (value !== 'valid') {
            throw new Error(`Parameter "${param}" must be valid`);
          }
        },
        {
          verify: () => undefined,
          toRegExp: () => '[a-z]+',
        },
      );

      registerConstraint('uuidish', constraint);

      expect(() => {
        match('/users/{id:uuidish}', { strict: true })('/users/invalid');
      }).toThrow('Parameter "id" must be valid');
    });

    it('should not throw custom constraint validation error when strict mode is disabled', () => {
      const constraint: ConstraintValidation = Object.assign(
        (param: string, value: string | number | boolean | undefined) => {
          if (value !== 'valid') {
            throw new Error(`Parameter "${param}" must be valid`);
          }
        },
        {
          verify: () => undefined,
          toRegExp: () => '[a-z]+',
        },
      );

      registerConstraint('uuidish', constraint);

      expect(match('/users/{id:uuidish}')('/users/invalid')).toEqual({
        match: false,
        params: null,
      });
    });

    it('should match custom constraint when strict mode is enabled and value is valid', () => {
      const constraint: ConstraintValidation = Object.assign(
        (param: string, value: string | number | boolean | undefined) => {
          if (value !== 'valid') {
            throw new Error(`Parameter "${param}" must be valid`);
          }
        },
        {
          verify: () => undefined,
          toRegExp: () => '[a-z]+',
        },
      );

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
});
