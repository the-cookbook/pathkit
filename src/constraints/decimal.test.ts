import decimal from './decimal';

describe('constraints/decimal', () => {
  describe('validation', () => {
    it('should throw when unexpected parameters are provided', () => {
      expect(() => {
        decimal('page', '1', 'foo');
      }).toThrow(
        /Constraint 'decimal' declared for 'page' parameter does not require parameter\(s\), but got '\(foo\)'/,
      );
    });

    it.each([
      ['-999.999'],
      ['-12.34'],
      ['-1.5'],
      ['-1'],
      ['0'],
      ['1'],
      ['9'],
      ['99'],
      ['999'],
      ['0.1'],
      ['1.0'],
      ['12.34'],
      ['999.999'],
    ])('should accept decimal value "%s"', (value) => {
      expect(() => {
        decimal('page', value, '');
      }).not.toThrow();
    });

    it.each([
      [''],
      [' '],
      ['foo'],
      ['1.'],
      ['.1'],
      ['1.2.3'],
      ['1e5'],
      ['0x10'],
      ['Infinity'],
      ['NaN'],
    ])('should throw when value "%s" is not a valid decimal', (value) => {
      expect(() => {
        decimal('page', value, '');
      }).toThrow(/must be a decimal number, instead got 'string'/i);
    });

    it.each([null, undefined])('should throw when value is %s', () => {
      expect(() => {
        decimal('page', '', '');
      }).toThrow(/must be a decimal number/i);
    });
  });

  describe('verify()', () => {
    it('should not throw when params are empty', () => {
      expect(() => {
        decimal.verify('page', '');
      }).not.toThrow();
    });

    it('should not throw when params are only whitespace', () => {
      expect(() => {
        decimal.verify('page', '   ');
      }).not.toThrow();
    });

    it('should throw when params are provided', () => {
      expect(() => {
        decimal.verify('page', 'foo');
      }).toThrow(
        /Constraint 'decimal' declared for 'page' parameter does not require parameter\(s\), but got '\(foo\)'/,
      );
    });
  });

  describe('toRegExp()', () => {
    it('should return the decimal RegExp source', () => {
      expect(decimal.toRegExp('')).toEqual('-?\\d+(?:\\.\\d+)?');
    });

    it.each([['-1'], ['-1.5'], ['0'], ['1'], ['99'], ['0.1'], ['1.0'], ['12.34']])(
      'should match valid decimal value "%s"',
      (value) => {
        const regexp = new RegExp(`^${decimal.toRegExp('')}$`);

        expect(regexp.test(value)).toBe(true);
      },
    );

    it.each([[''], ['foo'], ['1.'], ['.1'], ['1e5'], ['1.2.3']])(
      'should not match invalid decimal value "%s"',
      (value) => {
        const regexp = new RegExp(`^${decimal.toRegExp('')}$`);

        expect(regexp.test(value)).toBe(false);
      },
    );
  });
});
