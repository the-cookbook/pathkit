import minlength from './minlength';

describe('constraints/minlength', () => {
  describe('validation', () => {
    it.each([
      ['2', 'f'],
      ['3', 'fo'],
    ])('should throw when min length does not match', (minLength, value) => {
      expect(() => {
        minlength('page', value, minLength);
      }).toThrow();
    });

    it.each([
      ['2', 'fo'],
      ['2', 'foo'],
      ['2', 'foo-bar'],
    ])('should not throw when min length are in range', (minLength, value) => {
      expect(() => {
        minlength('page', value, minLength);
      }).not.toThrow();
    });
  });

  describe('verify()', () => {
    it('should throw when no constraint value is provided', () => {
      expect(() => {
        minlength.verify('page', '');
      }).toThrow(/requires a min length value/);
    });

    it('should throw when non-number or decimal constraint value is provided', () => {
      expect(() => {
        minlength.verify('page', 'a');
      }).toThrow(/requires an integer value/);
      expect(() => {
        minlength.verify('page', '1.1');
      }).toThrow(/requires an integer value/);
    });

    it('should throw when zero or negative number constraint value is provided', () => {
      expect(() => {
        minlength.verify('page', '0');
      }).toThrow(/requires a value greather or equal to 1/);
      expect(() => {
        minlength.verify('page', '-1');
      }).toThrow(/requires a value greather or equal to 1/);
    });
  });

  describe('toRegExp()', () => {
    it('should return the minlength RegExp source', () => {
      expect(minlength.toRegExp('')).toEqual('.*');
    });

    const regexp = new RegExp(`^(?:${minlength.toRegExp('')})(?![\\s\\S])`, 'su');

    const values = [
      // numbers
      '-1',
      '-1.5',
      '0',
      '1',
      '99',
      '0.1',
      '1.0',
      '12.34',

      // latin / accents
      'foo',
      'foo-bar',
      'fußball',
      'águia',
      'ação',
      'crème brûlée',
      'niño',
      'São Paulo',
      'München',

      // non-latin scripts
      '你好',
      'こんにちは',
      '안녕하세요',
      'Привет',
      'مرحبا',
      'שלום',
      'हिन्दी',
      'বাংলা',
      'ไทย',

      // symbols / punctuation / spacing
      '!@#$%^&*()',
      '[]{}<>',
      'foo_bar',
      'foo.bar',
      'foo/bar',
      'foo\\bar',
      'foo:bar',
      'foo;bar',
      'foo,bar',
      'foo bar',
      ' leading',
      'trailing ',
      'multiple   spaces',

      // unicode edge cases
      '👋',
      '🚀🔥',
      'café',
      'cafe\u0301', // same visual result as café, but using combining mark
      '中文-English-123',
      'العربية-123',
      '👨‍👩‍👧‍👦', // zero-width-joiner sequence

      // line breaks / tabs
      'foo\nbar',
      'foo\r\nbar',
      'foo\tbar',
    ];

    it.each(values)('should match any value "%s"', (value) => {
      expect(regexp.test(value)).toBe(true);
    });
  });
});
