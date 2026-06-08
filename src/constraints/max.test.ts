import max from './max';

describe('constraints/max', () => {
  describe('validation', () => {
    it.each([
      ['2', 'foo'],
      ['3', 'foo-bar'],
    ])('should throw when parameter value is not a number', (maxValue, value) => {
      expect(() => {
        max('page', value, maxValue);
      }).toThrow();
    });

    it.each([
      ['2', '3'],
      ['3', '4'],
      ['3', '4.5'],
    ])('should throw when max value does not match', (maxValue, value) => {
      expect(() => {
        max('page', value, maxValue);
      }).toThrow();
    });

    it.each([
      ['3', '0'],
      ['3', '-2.99'],
      ['3', '-1'],
      ['3', '0'],
      ['3', '1'],
      ['3', '2'],
      ['3', '2.99'],
      ['3', '3'],
    ])('should not throw when max value are in range', (maxValue, value) => {
      expect(() => {
        max('page', value, maxValue);
      }).not.toThrow();
    });
  });

  describe('verify()', () => {
    it('should throw when no constraint value is provided', () => {
      expect(() => {
        max.verify('page', '');
      }).toThrow(/requires a max value/);
    });

    it('should throw when non-number or decimal constraint value is provided', () => {
      expect(() => {
        max.verify('page', 'a');
      }).toThrow(/requires an integer value/);
      expect(() => {
        max.verify('page', '1.1');
      }).toThrow(/requires an integer value/);
    });

    it('should not throw when zero or negative number constraint value is provided', () => {
      expect(() => {
        max.verify('page', '0');
      }).not.toThrow(/requires a value greather or equal to 1/);
      expect(() => {
        max.verify('page', '-1');
      }).not.toThrow(/requires a value greather or equal to 1/);
    });
  });

  describe('toRegExp()', () => {
    it('should return the decimal RegExp source', () => {
      expect(max.toRegExp('')).toEqual('-?\\d+(?:\\.\\d+)?');
    });

    it.each([['-1'], ['-1.5'], ['0'], ['1'], ['99'], ['0.1'], ['1.0'], ['12.34']])(
      'should match valid number value "%s"',
      (value) => {
        const regexp = new RegExp(`^${max.toRegExp('')}$`);

        expect(regexp.test(value)).toBe(true);
      },
    );

    it.each([[''], ['foo'], ['1.'], ['.1'], ['1e5'], ['1.2.3']])(
      'should not match invalid number value "%s"',
      (value) => {
        const regexp = new RegExp(`^${max.toRegExp('')}$`);

        expect(regexp.test(value)).toBe(false);
      },
    );
  });
});
