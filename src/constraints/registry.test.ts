import { vi } from 'vitest';

import compile from '../compile';
import match from '../match';
import type { ConstraintValidation } from '../contracts';
import {
  getConstraint,
  hasConstraint,
  createConstraint,
  registerConstraint,
  resetConstraints,
  unregisterConstraint,
} from './registry';

const slug = createConstraint({
  parse: (paramName, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Parameter "${paramName}" must be a string`);
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid slug`);
    }
  },
  verify: (paramName, params) => {
    if (params.trim().length) {
      throw new Error(
        `[Constraint] Constraint 'slug' declared for '${paramName}' does not accept parameters, ` +
          `but got '(${params})'`,
      );
    }
  },
  toRegExp: () => '[a-z0-9-]+',
});

describe('constraints/registry', () => {
  afterEach(() => {
    resetConstraints();
  });

  it('should expose built-in constraints by default', () => {
    expect(hasConstraint('int')).toBe(true);
    expect(hasConstraint('list')).toBe(true);
    expect(hasConstraint('range')).toBe(true);
    expect(hasConstraint('regex')).toBe(true);

    expect(getConstraint('int')).toBeTypeOf('function');
    expect(getConstraint('list')).toBeTypeOf('function');
    expect(getConstraint('range')).toBeTypeOf('function');
    expect(getConstraint('regex')).toBeTypeOf('function');
  });

  it('should call verify before parsing a constraint value', () => {
    const verify = vi.fn();

    const constraint = createConstraint({
      parse: vi.fn(),
      verify,
      toRegExp: () => '[a-z0-9-]+',
    });

    constraint('options', 'hello', 'hello|world');

    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenCalledWith('options', 'hello|world');
  });

  it('should register custom constraint', () => {
    registerConstraint('slug', slug);

    expect(hasConstraint('slug')).toBe(true);
    expect(getConstraint('slug')).toBe(slug);
  });

  it('should unregister custom constraint', () => {
    registerConstraint('slug', slug);
    unregisterConstraint('slug');

    expect(hasConstraint('slug')).toBe(false);
    expect(getConstraint('slug')).toBeUndefined();
  });

  it('should use custom constraint while matching', () => {
    registerConstraint('slug', slug);

    expect(match('/posts/{slug:slug}')('/posts/hello-world')).toEqual({
      match: true,
      params: {
        slug: 'hello-world',
      },
    });
  });

  it('should reject paths that do not satisfy custom constraint regexp', () => {
    registerConstraint('slug', slug);

    expect(match('/posts/{slug:slug}')('/posts/Hello_World')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should use custom constraint while compiling', () => {
    registerConstraint('slug', slug);

    expect(compile('/posts/{slug:slug}')({ slug: 'hello-world' })).toBe('/posts/hello-world');
  });

  it('should throw custom constraint error while compiling invalid params', () => {
    registerConstraint('slug', slug);

    expect(() => compile('/posts/{slug:slug}')({ slug: 'Hello_World' })).toThrow(
      'Parameter "slug" must be a valid slug',
    );
  });

  it('should allow replacing an existing custom constraint', () => {
    const first: ConstraintValidation = createConstraint({
      parse: () => undefined,
      verify: () => undefined,
      toRegExp: () => 'first',
    });

    const second: ConstraintValidation = createConstraint({
      parse: () => undefined,
      verify: () => undefined,
      toRegExp: () => 'second',
    });

    registerConstraint('slug', first);
    registerConstraint('slug', second);

    expect(getConstraint('slug')).toBe(second);
  });

  it('should allow overriding built-in constraints', () => {
    const strictInt = createConstraint({
      parse: (param, value) => {
        if (value !== '42') {
          throw new Error(`Parameter "${param}" must be 42`);
        }
      },
      verify: () => undefined,
      toRegExp: () => '42',
    });

    registerConstraint('int', strictInt);

    expect(match('/answer/{value:int}')('/answer/42')).toEqual({
      match: true,
      params: {
        value: '42',
      },
    });

    expect(match('/answer/{value:int}')('/answer/41')).toEqual({
      match: false,
      params: null,
    });
  });

  it('should restore built-in constraints after reset', () => {
    registerConstraint(
      'int',
      createConstraint({ parse: () => undefined, verify: () => undefined, toRegExp: () => '42' }),
    );

    resetConstraints();

    expect(match('/answer/{value:int}')('/answer/41')).toEqual({
      match: true,
      params: {
        value: '41',
      },
    });
  });
});
