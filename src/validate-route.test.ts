import validateRoute from './validate-route';
import { createConstraint, registerConstraint, unregisterConstraint } from './constraints/registry';

describe('validate-route', () => {
  afterEach(() => {
    unregisterConstraint('test');
    unregisterConstraint('throws-error');
    unregisterConstraint('throws-string');
  });

  describe('route pattern', () => {
    it('should not throw on valid literal route pattern', () => {
      expect(() => {
        validateRoute('/articles');
      }).not.toThrow();
    });

    it('should not throw on valid parameter route pattern without constraints', () => {
      expect(() => {
        validateRoute('/articles/{slug}');
      }).not.toThrow();
    });

    it('should not throw on valid optional parameter route pattern without constraints', () => {
      expect(() => {
        validateRoute('/articles/{slug?}');
      }).not.toThrow();
    });

    it('should not throw on valid wildcard parameter route pattern without constraints', () => {
      expect(() => {
        validateRoute('/files/{*path}');
      }).not.toThrow();
    });

    it('should throw error on not closed parameter signature', () => {
      expect(() => {
        validateRoute('/say/{message');
      }).toThrow();
    });

    it('should throw error on malformed parameter signature', () => {
      expect(() => {
        validateRoute('/say/{message()}');
      }).toThrow();
    });

    it('should throw error on invalid constraint', () => {
      expect(() => {
        validateRoute('/say/{message:()}');
      }).toThrow();

      expect(() => {
        validateRoute('/say/{message:$()}');
      }).toThrow();
    });
  });

  describe('parameter constraint', () => {
    it('should not throw when registered constraint verifies successfully', () => {
      const verify = () => undefined;

      const constraint = createConstraint({
        parse: () => undefined,
        verify,
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('test', constraint);

      expect(() => {
        validateRoute('/articles/{slug:test}');
      }).not.toThrow();
    });

    it('should call verify with parameter name and constraint params', () => {
      const calls: [paramName: string, params: string][] = [];

      const constraint = createConstraint({
        parse: () => undefined,
        verify: (paramName, params) => {
          calls.push([paramName, params]);
        },
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('test', constraint);

      validateRoute('/articles/{slug:test(foo)}');

      expect(calls).toEqual([['slug', 'foo']]);
    });

    it('should call verify for each constraint declared on a parameter', () => {
      const calls: [paramName: string, params: string][] = [];

      const constraint = createConstraint({
        parse: () => undefined,
        verify: (paramName, params) => {
          calls.push([paramName, params]);
        },
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('test', constraint);

      validateRoute('/articles/{slug:test(foo):test(bar)}');

      expect(calls).toEqual([
        ['slug', 'foo'],
        ['slug', 'bar'],
      ]);
    });

    it('should call verify for each constrained parameter segment', () => {
      const calls: [paramName: string, params: string][] = [];

      const constraint = createConstraint({
        parse: () => undefined,
        verify: (paramName, params) => {
          calls.push([paramName, params]);
        },
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('test', constraint);

      validateRoute('/articles/{category:test(news)}/{slug:test(featured)}');

      expect(calls).toEqual([
        ['category', 'news'],
        ['slug', 'featured'],
      ]);
    });

    it('should throw error on unknown constraint type', () => {
      expect(() => {
        validateRoute('/say/{message:foo}');
      }).toThrow(
        '[Constraint]: Unknown constraint type: "foo" for route pattern "/say/{message:foo}"',
      );
    });

    it('should throw error on unknown constraint type after verifying previous registered constraints', () => {
      const calls: [paramName: string, params: string][] = [];

      const constraint = createConstraint({
        parse: () => undefined,
        verify: (paramName, params) => {
          calls.push([paramName, params]);
        },
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('test', constraint);

      expect(() => {
        validateRoute('/articles/{slug:test(foo):unknown}');
      }).toThrow(
        '[Constraint]: Unknown constraint type: "unknown" for route pattern "/articles/{slug:test(foo):unknown}"',
      );

      expect(calls).toEqual([['slug', 'foo']]);
    });

    it('should throw error on invalid built-in constraint params', () => {
      expect(() => {
        validateRoute('/say/{message:range(1,2,3)}');
      }).toThrow();
    });

    it('should wrap error thrown by constraint verify with route context', () => {
      const constraint = createConstraint({
        parse: () => undefined,
        verify: () => {
          throw new Error('Invalid test constraint params');
        },
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('throws-error', constraint);

      expect(() => {
        validateRoute('/articles/{slug:throws-error(foo)}');
      }).toThrow('Invalid test constraint params.\n Route: /articles/{slug:throws-error(foo)}');
    });

    it('should rethrow non-error thrown by constraint verify', () => {
      const constraint = createConstraint({
        parse: () => undefined,
        verify: () => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'Invalid thrown value';
        },
        toRegExp: () => '[a-z0-9-]+',
      });

      registerConstraint('throws-string', constraint);

      try {
        validateRoute('/articles/{slug:throws-string(foo)}');

        throw new Error('Expected validateRoute to throw.');
      } catch (error) {
        expect(error).toBe('Invalid thrown value');
      }
    });
  });
});
