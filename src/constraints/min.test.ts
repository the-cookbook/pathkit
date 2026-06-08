import min from './min';

describe('constraints/min', () => {
  describe('validation', () => {
    it.each([
      ['2', 'foo'],
      ['3', 'foo-bar'],
    ])('should throw when parameter value is not a number', (minValue, value) => {
      expect(() => {
        min('page', value, minValue);
      }).toThrow();
    });

    it.each([
      ['4', '3'],
      ['5', '4'],
      ['5', '4.5'],
    ])('should throw when min value does not match', (minValue, value) => {
      expect(() => {
        min('page', value, minValue);
      }).toThrow();
    });

    it.each([
      ['0', '0'],
      ['-3', '-2.99'],
      ['-1', '-1'],
      ['-1', '0'],
      ['1', '1'],
      ['1', '2'],
      ['1', '2.99'],
      ['1', '3'],
    ])('should not throw when min value are in range', (minValue, value) => {
      expect(() => {
        min('page', value, minValue);
      }).not.toThrow();
    });
  });

  describe('verify()', () => {
    it('should throw when no constraint value is provided', () => {
      expect(() => {
        min.verify('page', '');
      }).toThrow(/requires a min value/);
    });

    it('should throw when non-number or decimal constraint value is provided', () => {
      expect(() => {
        min.verify('page', 'a');
      }).toThrow(/requires an integer value/);
      expect(() => {
        min.verify('page', '1.1');
      }).toThrow(/requires an integer value/);
    });

    it('should not throw when zero or negative number constraint value is provided', () => {
      expect(() => {
        min.verify('page', '0');
      }).not.toThrow(/requires a value greather or equal to 1/);
      expect(() => {
        min.verify('page', '-1');
      }).not.toThrow(/requires a value greather or equal to 1/);
    });
  });

  describe('toRegExp()', () => {
    it('should return the decimal RegExp source', () => {
      expect(min.toRegExp('')).toEqual('-?\\d+(?:\\.\\d+)?');
    });

    it.each([['-1'], ['-1.5'], ['0'], ['1'], ['99'], ['0.1'], ['1.0'], ['12.34']])(
      'should match valid number value "%s"',
      (value) => {
        const regexp = new RegExp(`^${min.toRegExp('')}$`);

        expect(regexp.test(value)).toBe(true);
      },
    );

    it.each([[''], ['foo'], ['1.'], ['.1'], ['1e5'], ['1.2.3']])(
      'should not match invalid number value "%s"',
      (value) => {
        const regexp = new RegExp(`^${min.toRegExp('')}$`);

        expect(regexp.test(value)).toBe(false);
      },
    );
  });
});
