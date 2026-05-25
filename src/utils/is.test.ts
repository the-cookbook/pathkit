import { is } from './is';

describe('is', () => {
  describe('nullish', () => {
    it('should return true when value is null', () => {
      expect(is.nullish(null)).toBe(true);
    });

    it('should return true when value is undefined', () => {
      expect(is.nullish(undefined)).toBe(true);
    });

    it.each(['', 0, false, [], {}, Number.NaN])('should return false when value is %s', (value) => {
      expect(is.nullish(value)).toBe(false);
    });

    it('should narrow value to null or undefined', () => {
      const value = null as string | null | undefined;

      if (is.nullish(value)) {
        expectTypeOf(value).toEqualTypeOf<null | undefined>();
      }
    });
  });

  describe('truthy', () => {
    it('should return false when value is null', () => {
      expect(is.truthy(null)).toBe(false);
    });

    it('should return false when value is undefined', () => {
      expect(is.truthy(undefined)).toBe(false);
    });

    it.each(['', 0, false, Number.NaN])(
      'should return false when value is falsy primitive %s',
      (value) => {
        expect(is.truthy(value)).toBe(false);
      },
    );

    it('should return false when value is an empty array', () => {
      expect(is.truthy([])).toBe(false);
    });

    it.each(['hello', 1, true, {}, ['hello']])(
      'should return true when value is truthy %s',
      (value) => {
        expect(is.truthy(value)).toBe(true);
      },
    );

    it('should narrow value to non-nullish value', () => {
      const value = 'hello' as string | null | undefined;

      if (is.truthy(value)) {
        expectTypeOf(value).toEqualTypeOf<string>();
      }
    });

    it('should preserve array type when value is a non-empty array', () => {
      const value = ['hello'] as string[] | null | undefined;

      if (is.truthy(value)) {
        expectTypeOf(value).toEqualTypeOf<string[]>();
      }
    });
  });

  describe('string', () => {
    it('should return true when value is a string', () => {
      expect(is.string('hello')).toBe(true);
    });

    it('should return true when value is an empty string', () => {
      expect(is.string('')).toBe(true);
    });

    it.each([1, true, null, undefined, [], {}, Symbol('hello')])(
      'should return false when value is not a string',
      (value) => {
        expect(is.string(value)).toBe(false);
      },
    );

    it('should narrow value to string', () => {
      const value = 'hello' as string | number;

      if (is.string(value)) {
        expectTypeOf(value).toEqualTypeOf<string>();
      }
    });
  });

  describe('number', () => {
    it('should return true when value is a number', () => {
      expect(is.number(1)).toBe(true);
    });

    it('should return true when value is zero', () => {
      expect(is.number(0)).toBe(true);
    });

    it('should return true when value is negative number', () => {
      expect(is.number(-1)).toBe(true);
    });

    it('should return false when value is NaN', () => {
      expect(is.number(Number.NaN)).toBe(false);
    });

    it.each(['1', true, null, undefined, [], {}, Symbol('1')])(
      'should return false when value is not a number',
      (value) => {
        expect(is.number(value)).toBe(false);
      },
    );

    it('should narrow value to number', () => {
      const value = 1 as string | number;

      if (is.number(value)) {
        expectTypeOf(value).toEqualTypeOf<number>();
      }
    });
  });

  describe('bool', () => {
    it('should return true when value is true', () => {
      expect(is.bool(true)).toBe(true);
    });

    it('should return true when value is false', () => {
      expect(is.bool(false)).toBe(true);
    });

    it.each(['true', 1, null, undefined, [], {}, Symbol('true')])(
      'should return false when value is not boolean',
      (value) => {
        expect(is.bool(value)).toBe(false);
      },
    );

    it('should narrow value to boolean', () => {
      const value = true as string | boolean;

      if (is.bool(value)) {
        expectTypeOf(value).toEqualTypeOf<boolean>();
      }
    });
  });

  describe('array', () => {
    it('should return true when value is an empty array', () => {
      expect(is.array([])).toBe(true);
    });

    it('should return true when value is a non-empty array', () => {
      expect(is.array(['hello'])).toBe(true);
    });

    it.each(['hello', 1, true, null, undefined, {}, Symbol('hello')])(
      'should return false when value is not an array',
      (value) => {
        expect(is.array(value)).toBe(false);
      },
    );

    it('should narrow value to array', () => {
      const value = ['hello'] as string[] | string;

      if (is.array<string>(value)) {
        expectTypeOf(value).toEqualTypeOf<string[]>();
      }
    });
  });
});
