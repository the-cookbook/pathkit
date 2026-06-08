import { afterEach, describe, expect, it, vi } from 'vitest';

import lexer from './lexer';
import type { Token } from './contracts';

describe('lexer', () => {
  afterEach(() => {
    vi.doUnmock('./utils/token');
    vi.resetModules();
  });

  describe('literal segments', () => {
    it('tokenize single literal segment', () => {
      const path = '/segment';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/segment', position: 0 },
        { type: 'EndOfInput', position: 8 },
      ] satisfies Token[]);
    });

    it('tokenize multiple literal segment', () => {
      const path = '/first/second';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/first/second', position: 0 },
        { type: 'EndOfInput', position: 13 },
      ] satisfies Token[]);
    });

    it('tokenize an empty route', () => {
      expect(lexer('')).toStrictEqual([{ type: 'EndOfInput', position: 0 }] satisfies Token[]);
    });

    it('tokenize literal segment with dot characters', () => {
      expect(lexer('/articles/post.json')).toStrictEqual([
        { type: 'Identifier', value: '/articles/post.json', position: 0 },
        { type: 'EndOfInput', position: 19 },
      ] satisfies Token[]);
    });
  });

  describe('parameter segments', () => {
    it('tokenize single parameter segment', () => {
      const path = '/{param}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'param', position: 2 },
        { type: 'CloseBrace', position: 7 },
        { type: 'EndOfInput', position: 8 },
      ] satisfies Token[]);
    });

    it('tokenize multiple parameter segment', () => {
      const path = '/{name}/{lastname}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'name', position: 2 },
        { type: 'CloseBrace', position: 6 },
        { type: 'Identifier', value: '/', position: 7 },
        { type: 'OpenBrace', position: 8 },
        { type: 'Identifier', value: 'lastname', position: 9 },
        { type: 'CloseBrace', position: 17 },
        { type: 'EndOfInput', position: 18 },
      ] satisfies Token[]);
    });

    it('tokenize wildcard parameter segment', () => {
      const path = '/{*slug}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Asterisk', position: 2 },
        { type: 'Identifier', value: 'slug', position: 3 },
        { type: 'CloseBrace', position: 7 },
        { type: 'EndOfInput', position: 8 },
      ] satisfies Token[]);
    });

    it('tokenize optional parameter segment', () => {
      const path = '/{name?}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'name', position: 2 },
        { type: 'QuestionMark', position: 6 },
        { type: 'CloseBrace', position: 7 },
        { type: 'EndOfInput', position: 8 },
      ] satisfies Token[]);
    });

    it('tokenize optional wildcard parameter segment', () => {
      const path = '/{*path?}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Asterisk', position: 2 },
        { type: 'Identifier', value: 'path', position: 3 },
        { type: 'QuestionMark', position: 7 },
        { type: 'CloseBrace', position: 8 },
        { type: 'EndOfInput', position: 9 },
      ] satisfies Token[]);
    });

    it('tokenize optional constrained parameter segment', () => {
      const path = '/{id:int?}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'id', position: 2 },
        { type: 'Colon', position: 4 },
        { type: 'Identifier', value: 'int', position: 5 },
        { type: 'QuestionMark', position: 8 },
        { type: 'CloseBrace', position: 9 },
        { type: 'EndOfInput', position: 10 },
      ] satisfies Token[]);
    });

    it('tokenize parameter constraint segment', () => {
      const path = '/{name:uuid}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'name', position: 2 },
        { type: 'Colon', position: 6 },
        { type: 'Identifier', value: 'uuid', position: 7 },
        { type: 'CloseBrace', position: 11 },
        { type: 'EndOfInput', position: 12 },
      ] satisfies Token[]);
    });

    it('tokenize values from parameter constraint segment', () => {
      const path = '/{page:list(contact|news)}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'page', position: 2 },
        { type: 'Colon', position: 6 },
        { type: 'Identifier', value: 'list', position: 7 },
        { type: 'LeftParen', position: 11 },
        { type: 'Identifier', value: 'contact|news', position: 12 },
        { type: 'RightParen', position: 24 },
        { type: 'CloseBrace', position: 25 },
        { type: 'EndOfInput', position: 26 },
      ] satisfies Token[]);
    });

    it('tokenize values from parameter constraint segment separated by comma', () => {
      const path = '/{page:range(1,10)}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'page', position: 2 },
        { type: 'Colon', position: 6 },
        { type: 'Identifier', value: 'range', position: 7 },
        { type: 'LeftParen', position: 12 },
        { type: 'Identifier', value: '1', position: 13 },
        { type: 'Comma', position: 14 },
        { type: 'Identifier', value: '10', position: 15 },
        { type: 'RightParen', position: 17 },
        { type: 'CloseBrace', position: 18 },
        { type: 'EndOfInput', position: 19 },
      ] satisfies Token[]);
    });

    it('tokenize nested parameter constraint segments', () => {
      const path = '/{page:int:range(1,10)}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/', position: 0 },
        { type: 'OpenBrace', position: 1 },
        { type: 'Identifier', value: 'page', position: 2 },
        { type: 'Colon', position: 6 },
        { type: 'Identifier', value: 'int', position: 7 },
        { type: 'Colon', position: 10 },
        { type: 'Identifier', value: 'range', position: 11 },
        { type: 'LeftParen', position: 16 },
        { type: 'Identifier', value: '1', position: 17 },
        { type: 'Comma', position: 18 },
        { type: 'Identifier', value: '10', position: 19 },
        { type: 'RightParen', position: 21 },
        { type: 'CloseBrace', position: 22 },
        { type: 'EndOfInput', position: 23 },
      ] satisfies Token[]);
    });

    it('tokenize nested file path like pattern', () => {
      const path = 'c://{name}.{ext}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: 'c', position: 0 },
        { type: 'Colon', position: 1 },
        { type: 'Identifier', value: '//', position: 2 },
        { type: 'OpenBrace', position: 4 },
        { type: 'Identifier', value: 'name', position: 5 },
        { type: 'CloseBrace', position: 9 },
        { type: 'Identifier', value: '.', position: 10 },
        { type: 'OpenBrace', position: 11 },
        { type: 'Identifier', value: 'ext', position: 12 },
        { type: 'CloseBrace', position: 15 },
        { type: 'EndOfInput', position: 16 },
      ] satisfies Token[]);
    });
  });

  describe('single-character tokens', () => {
    it('tokenize every supported token character', () => {
      expect(lexer('{}:?*,()\\x')).toStrictEqual([
        { type: 'OpenBrace', position: 0 },
        { type: 'CloseBrace', position: 1 },
        { type: 'Colon', position: 2 },
        { type: 'QuestionMark', position: 3 },
        { type: 'Asterisk', position: 4 },
        { type: 'Comma', position: 5 },
        { type: 'LeftParen', position: 6 },
        { type: 'RightParen', position: 7 },
        { type: 'EscapedChar', value: '\\x', position: 8 },
        { type: 'EndOfInput', position: 10 },
      ] satisfies Token[]);
    });
  });

  describe('nested segments', () => {
    it('tokenize simple nested segments types', () => {
      const path = '/say/{message}';

      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'CloseBrace', position: 13 },
        { type: 'EndOfInput', position: 14 },
      ] satisfies Token[]);
    });
  });

  describe('segment escaping', () => {
    const paths: [path: string, expectations: Token[]][] = [
      [
        '/path/with/\\{literal_braces\\}',
        [
          { type: 'Identifier', value: '/path/with/', position: 0 },
          { type: 'EscapedChar', value: '\\{', position: 11 },
          { type: 'Identifier', value: 'literal_braces', position: 13 },
          { type: 'EscapedChar', value: '\\}', position: 27 },
          { type: 'EndOfInput', position: 29 },
        ],
      ],
      [
        '/path/with/{param\\:Name}',
        [
          { type: 'Identifier', value: '/path/with/', position: 0 },
          { type: 'OpenBrace', position: 11 },
          { type: 'Identifier', value: 'param', position: 12 },
          { type: 'EscapedChar', value: '\\:', position: 17 },
          { type: 'Identifier', value: 'Name', position: 19 },
          { type: 'CloseBrace', position: 23 },
          { type: 'EndOfInput', position: 24 },
        ],
      ],
      [
        '/path/with/{*wildcard\\*}',
        [
          { type: 'Identifier', value: '/path/with/', position: 0 },
          { type: 'OpenBrace', position: 11 },
          { type: 'Asterisk', position: 12 },
          { type: 'Identifier', value: 'wildcard', position: 13 },
          { type: 'EscapedChar', value: '\\*', position: 21 },
          { type: 'CloseBrace', position: 23 },
          { type: 'EndOfInput', position: 24 },
        ],
      ],
      [
        '/path/with/{paramName:regex(/([0-9]+)/)}',
        [
          { type: 'Identifier', value: '/path/with/', position: 0 },
          { type: 'OpenBrace', position: 11 },
          { type: 'Identifier', value: 'paramName', position: 12 },
          { type: 'Colon', position: 21 },
          { type: 'Identifier', value: 'regex', position: 22 },
          { type: 'LeftParen', position: 27 },
          { type: 'Identifier', value: '/', position: 28 },
          { type: 'LeftParen', position: 29 },
          { type: 'Identifier', value: '[0-9]+', position: 30 },
          { type: 'RightParen', position: 36 },
          { type: 'Identifier', value: '/', position: 37 },
          { type: 'RightParen', position: 38 },
          { type: 'CloseBrace', position: 39 },
          { type: 'EndOfInput', position: 40 },
        ],
      ],
      [
        '/path/with/\\?query',
        [
          { type: 'Identifier', value: '/path/with/', position: 0 },
          { type: 'EscapedChar', value: '\\?', position: 11 },
          { type: 'Identifier', value: 'query', position: 13 },
          { type: 'EndOfInput', position: 18 },
        ],
      ],
    ];

    it.each(paths)('escapes "%s" accordingly', (path, expectation) => {
      expect(lexer(path)).toStrictEqual(expectation);
    });
  });

  describe('edge cases & error', () => {
    it('tokenized not closed parameter signature', () => {
      const path = '/say/{message';

      expect(() => lexer(path)).not.toThrow();
      expect(lexer(path)).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'EndOfInput', position: 13 },
      ] satisfies Token[]);
    });

    it('tokenized on malformed parameter signature', () => {
      expect(() => lexer('/say/{message()}')).not.toThrow();
      expect(lexer('/say/{message()}')).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'LeftParen', position: 13 },
        { type: 'RightParen', position: 14 },
        { type: 'CloseBrace', position: 15 },
        { type: 'EndOfInput', position: 16 },
      ] satisfies Token[]);

      expect(() => lexer('/say/{message:range})')).not.toThrow();
      expect(lexer('/say/{message:range})')).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'Colon', position: 13 },
        { type: 'Identifier', value: 'range', position: 14 },
        { type: 'CloseBrace', position: 19 },
        { type: 'RightParen', position: 20 },
        { type: 'EndOfInput', position: 21 },
      ] satisfies Token[]);
    });

    it('tokenized on invalid constraint', () => {
      expect(() => lexer('/say/{message:()}')).not.toThrow();
      expect(lexer('/say/{message:()}')).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'Colon', position: 13 },
        { type: 'LeftParen', position: 14 },
        { type: 'RightParen', position: 15 },
        { type: 'CloseBrace', position: 16 },
        { type: 'EndOfInput', position: 17 },
      ] satisfies Token[]);

      expect(() => lexer('/say/{message:int:$()}')).not.toThrow();
      expect(lexer('/say/{message:int:$()}')).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'Colon', position: 13 },
        { type: 'Identifier', value: 'int', position: 14 },
        { type: 'Colon', position: 17 },
        { type: 'Identifier', value: '$', position: 18 },
        { type: 'LeftParen', position: 19 },
        { type: 'RightParen', position: 20 },
        { type: 'CloseBrace', position: 21 },
        { type: 'EndOfInput', position: 22 },
      ] satisfies Token[]);

      expect(() => lexer('/say/{message:range(}')).not.toThrow();
      expect(lexer('/say/{message:range(}')).toStrictEqual([
        { type: 'Identifier', value: '/say/', position: 0 },
        { type: 'OpenBrace', position: 5 },
        { type: 'Identifier', value: 'message', position: 6 },
        { type: 'Colon', position: 13 },
        { type: 'Identifier', value: 'range', position: 14 },
        { type: 'LeftParen', position: 19 },
        { type: 'CloseBrace', position: 20 },
        { type: 'EndOfInput', position: 21 },
      ] satisfies Token[]);
    });

    it('throws error on dangling escape character', () => {
      const path = '/say\\';

      expect(() => lexer(path)).toThrow(
        'Unexpected end of input after escape character at index 5',
      );
    });

    it('throws error when route contains an empty character before end of input', () => {
      const route = {
        length: 1,
      } as unknown as string;

      expect(() => lexer(route)).toThrow('[Lexer] Unexpected empty character at index 0');
    });

    it('throws error when the lexer index does not advance', async () => {
      vi.doMock('./utils/token', () => ({
        charToTokenType: {},
        tokenTypeCharList: ['@'],
      }));

      const { default: mockedLexer } = await import('./lexer');

      expect(() => mockedLexer('@')).toThrow(
        "[Lexer] Infinite loop detected: index 'i' did not increment at position 0. Current character: '@'",
      );
    });
  });
});
