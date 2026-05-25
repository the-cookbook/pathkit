import { typeOf } from './type-of';

describe('typeOf', () => {
  describe('primitive values', () => {
    it('should return string when value is a string', () => {
      expect(typeOf('hello')).toBe('string');
    });

    it('should return string when value is an empty string', () => {
      expect(typeOf('')).toBe('string');
    });

    it('should return number when value is a number', () => {
      expect(typeOf(123)).toBe('number');
    });

    it('should return number when value is NaN', () => {
      expect(typeOf(Number.NaN)).toBe('number');
    });

    it('should return number when value is Infinity', () => {
      expect(typeOf(Infinity)).toBe('number');
    });

    it('should return boolean when value is true', () => {
      expect(typeOf(true)).toBe('boolean');
    });

    it('should return boolean when value is false', () => {
      expect(typeOf(false)).toBe('boolean');
    });

    it('should return undefined when value is undefined', () => {
      expect(typeOf(undefined)).toBe('undefined');
    });

    it('should return null when value is null', () => {
      expect(typeOf(null)).toBe('null');
    });

    it('should return symbol when value is a symbol', () => {
      expect(typeOf(Symbol('test'))).toBe('symbol');
    });

    it('should return bigint when value is a bigint', () => {
      expect(typeOf(10n)).toBe('bigint');
    });
  });

  describe('object values', () => {
    it('should return object when value is a plain object', () => {
      expect(typeOf({})).toBe('object');
    });

    it('should return array when value is an array', () => {
      expect(typeOf([])).toBe('array');
    });

    it('should return date when value is a date', () => {
      expect(typeOf(new Date('2025-01-01T00:00:00.000Z'))).toBe('date');
    });

    it('should return regexp when value is a regular expression', () => {
      expect(typeOf(/[a-z]+/)).toBe('regexp');
    });

    it('should return map when value is a map', () => {
      expect(typeOf(new Map())).toBe('map');
    });

    it('should return set when value is a set', () => {
      expect(typeOf(new Set())).toBe('set');
    });

    it('should return weakmap when value is a weak map', () => {
      expect(typeOf(new WeakMap())).toBe('weakmap');
    });

    it('should return weakset when value is a weak set', () => {
      expect(typeOf(new WeakSet())).toBe('weakset');
    });

    it('should return error when value is an error', () => {
      expect(typeOf(new Error('test'))).toBe('error');
    });

    it('should return promise when value is a promise', () => {
      expect(typeOf(Promise.resolve())).toBe('promise');
    });
  });

  describe('function values', () => {
    it('should return function when value is a function declaration', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(typeOf(function test() {})).toBe('function');
    });

    it('should return function when value is an arrow function', () => {
      expect(typeOf(() => undefined)).toBe('function');
    });

    it('should return asyncfunction when value is an async function', () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      expect(typeOf(async () => undefined)).toBe('asyncfunction');
    });

    it('should return generatorfunction when value is a generator function', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(typeOf(function* test() {})).toBe('generatorfunction');
    });
  });

  describe('typed arrays and buffers', () => {
    it('should return arraybuffer when value is an array buffer', () => {
      expect(typeOf(new ArrayBuffer(8))).toBe('arraybuffer');
    });

    it('should return uint8array when value is a Uint8Array', () => {
      expect(typeOf(new Uint8Array())).toBe('uint8array');
    });

    it('should return int8array when value is an Int8Array', () => {
      expect(typeOf(new Int8Array())).toBe('int8array');
    });

    it('should return uint16array when value is a Uint16Array', () => {
      expect(typeOf(new Uint16Array())).toBe('uint16array');
    });

    it('should return int16array when value is an Int16Array', () => {
      expect(typeOf(new Int16Array())).toBe('int16array');
    });

    it('should return uint32array when value is a Uint32Array', () => {
      expect(typeOf(new Uint32Array())).toBe('uint32array');
    });

    it('should return int32array when value is an Int32Array', () => {
      expect(typeOf(new Int32Array())).toBe('int32array');
    });

    it('should return float32array when value is a Float32Array', () => {
      expect(typeOf(new Float32Array())).toBe('float32array');
    });

    it('should return float64array when value is a Float64Array', () => {
      expect(typeOf(new Float64Array())).toBe('float64array');
    });
  });

  describe('edge cases', () => {
    it('should return object when value has a null prototype', () => {
      expect(typeOf(Object.create(null))).toBe('object');
    });

    it('should return object when value overrides toString', () => {
      const value = {
        toString: () => '[object Custom]',
      };

      expect(typeOf(value)).toBe('object');
    });

    it('should return the custom tag when value defines Symbol.toStringTag', () => {
      const value = {
        [Symbol.toStringTag]: 'CustomThing',
      };

      expect(typeOf(value)).toBe('customthing');
    });

    it('should return unknown when Object.prototype.toString does not contain a type match', () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalToString = Object.prototype.toString;

      Object.prototype.toString = () => '[object]';

      try {
        expect(typeOf('hello')).toBe('unknown');
      } finally {
        Object.prototype.toString = originalToString;
      }
    });

    it('should return unknown when Object.prototype.toString contains an empty tag', () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalToString = Object.prototype.toString;

      Object.prototype.toString = () => '[object ]';

      try {
        expect(typeOf('hello')).toBe('unknown');
      } finally {
        Object.prototype.toString = originalToString;
      }
    });
  });
});
