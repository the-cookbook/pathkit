import escapeRegex from './escape-regex';

describe('escapeRegex', () => {
  describe('plain text', () => {
    it('should return empty string when value is empty', () => {
      expect(escapeRegex('')).toBe('');
    });

    it('should return plain text unchanged', () => {
      expect(escapeRegex('hello-world')).toBe('hello-world');
    });

    it('should not escape regular route characters', () => {
      expect(escapeRegex('/users/profile/settings')).toBe('/users/profile/settings');
    });

    it('should not escape non-regex URL characters', () => {
      expect(escapeRegex('/search?q=test&sort=asc#results')).toBe(
        '/search\\?q=test&sort=asc#results',
      );
    });

    it('should not escape dash, colon, slash, hash, ampersand, equals or percent', () => {
      expect(escapeRegex('/api:v1/items-100#section&foo=bar%20')).toBe(
        '/api:v1/items-100#section&foo=bar%20',
      );
    });
  });

  describe('single special characters', () => {
    it.each([
      ['$', '\\$'],
      ['(', '\\('],
      [')', '\\)'],
      ['*', '\\*'],
      ['+', '\\+'],
      ['.', '\\.'],
      ['?', '\\?'],
      ['[', '\\['],
      ['\\', '\\\\'],
      [']', '\\]'],
      ['^', '\\^'],
      ['{', '\\{'],
      ['|', '\\|'],
      ['}', '\\}'],
    ] satisfies [value: string, expected: string][])('should escape "%s"', (value, expected) => {
      expect(escapeRegex(value)).toBe(expected);
    });
  });

  describe('special character groups', () => {
    it('should escape all supported regex special characters', () => {
      expect(escapeRegex('$()*+.?[\\]^{|}')).toBe('\\$\\(\\)\\*\\+\\.\\?\\[\\\\\\]\\^\\{\\|\\}');
    });

    it('should escape repeated special characters', () => {
      expect(escapeRegex('...???***')).toBe('\\.\\.\\.\\?\\?\\?\\*\\*\\*');
    });

    it('should escape adjacent special characters', () => {
      expect(escapeRegex('[]{}()')).toBe('\\[\\]\\{\\}\\(\\)');
    });

    it('should escape special characters mixed with text', () => {
      expect(escapeRegex('file(name).json')).toBe('file\\(name\\)\\.json');
    });

    it('should escape special characters at the start, middle, and end', () => {
      expect(escapeRegex('$user.name?')).toBe('\\$user\\.name\\?');
    });
  });

  describe('route and URL-like strings', () => {
    it('should escape special characters inside a route-like string', () => {
      expect(escapeRegex('/users/{id}/files/(draft).json?tab=$meta')).toBe(
        '/users/\\{id\\}/files/\\(draft\\)\\.json\\?tab=\\$meta',
      );
    });

    it('should escape route parameter syntax', () => {
      expect(escapeRegex('/articles/{slug}')).toBe('/articles/\\{slug\\}');
    });

    it('should escape wildcard route syntax', () => {
      expect(escapeRegex('/files/{*path?}')).toBe('/files/\\{\\*path\\?\\}');
    });

    it('should escape constraint route syntax', () => {
      expect(escapeRegex('/page/{id:regex([0-9]+)}')).toBe(
        '/page/\\{id:regex\\(\\[0-9\\]\\+\\)\\}',
      );
    });

    it('should escape file extension route syntax', () => {
      expect(escapeRegex('/files/{name}.{ext}')).toBe('/files/\\{name\\}\\.\\{ext\\}');
    });
  });

  describe('regex behavior', () => {
    it('should create a regex that matches the original literal value', () => {
      const value = '/users/{id}/files/(draft).json?tab=$meta';
      const pattern = new RegExp(`^${escapeRegex(value)}$`);

      expect(pattern.test(value)).toBe(true);
    });

    it('should create a regex that does not treat special characters as regex syntax', () => {
      const value = 'file(name).json';
      const pattern = new RegExp(`^${escapeRegex(value)}$`);

      expect(pattern.test('filenamexjson')).toBe(false);
      expect(pattern.test('file(name).json')).toBe(true);
    });

    it('should create a regex that does not treat question mark as optional syntax', () => {
      const value = '/search?term=test';
      const pattern = new RegExp(`^${escapeRegex(value)}$`);

      expect(pattern.test('/searchterm=test')).toBe(false);
      expect(pattern.test('/search?term=test')).toBe(true);
    });

    it('should create a regex that does not treat brackets as character classes', () => {
      const value = '/items/[abc]';
      const pattern = new RegExp(`^${escapeRegex(value)}$`);

      expect(pattern.test('/items/a')).toBe(false);
      expect(pattern.test('/items/[abc]')).toBe(true);
    });

    it('should create a regex that does not treat pipe as alternation', () => {
      const value = 'draft|published';
      const pattern = new RegExp(`^${escapeRegex(value)}$`);

      expect(pattern.test('draft')).toBe(false);
      expect(pattern.test('published')).toBe(false);
      expect(pattern.test('draft|published')).toBe(true);
    });

    it('should create a regex that does not treat caret or dollar as anchors', () => {
      const value = '^start-end$';
      const pattern = new RegExp(`^${escapeRegex(value)}$`);

      expect(pattern.test('start-end')).toBe(false);
      expect(pattern.test('^start-end$')).toBe(true);
    });
  });
});
