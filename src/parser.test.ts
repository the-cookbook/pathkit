import lexer from './lexer';
import Parser from './parser';
import type { ParameterSegment, RouteSegment, Token } from './contracts';

describe('Parse', () => {
  describe('literal segments', () => {
    it('tokenize single literal segment', () => {
      const path = '/segment';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/segment' },
      ] satisfies RouteSegment[]);
    });

    it('tokenize multiple literal segment', () => {
      const path = '/first/second';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/first/second' },
      ] satisfies RouteSegment[]);
    });

    it('tokenize empty route pattern', () => {
      const path = '';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([] satisfies RouteSegment[]);
    });

    it('tokenize literal segment with reserved characters escaped', () => {
      const path = '/path/with/\\{literal_braces\\}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        {
          type: 'literal',
          value: '/path/with/\\{literal_braces\\}',
        },
      ] satisfies RouteSegment[]);
    });
  });

  describe('parameter segments', () => {
    it('tokenize single parameter segment', () => {
      const path = '/{param}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'param',
          optional: false,
          wildcard: false,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize multiple parameter segment', () => {
      const path = '/{name}/{lastname}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'name',
          optional: false,
          wildcard: false,
          constraints: [],
        },
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'lastname',
          optional: false,
          wildcard: false,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize wildcard parameter segment', () => {
      const path = '/{*slug}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'slug',
          optional: false,
          wildcard: true,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize optional parameter segment', () => {
      const path = '/{name?}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'name',
          optional: true,
          wildcard: false,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize optional wildcard parameter segment', () => {
      const path = '/{*path?}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'path',
          optional: true,
          wildcard: true,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize parameter constraint segment', () => {
      const path = '/{name:uuid}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'name',
          optional: false,
          wildcard: false,
          constraints: [{ type: 'uuid', params: '' }],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize values from parameter constraint segment', () => {
      const path = '/{page:list(contact|news)}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'page',
          optional: false,
          wildcard: false,
          constraints: [{ type: 'list', params: 'contact|news' }],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize values from parameter constraint segment separated by comma', () => {
      const path = '/{page:range(1, 10)}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'page',
          optional: false,
          wildcard: false,
          constraints: [{ type: 'range', params: '1, 10' }],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize nested parameter constraint segments', () => {
      const path = '/{page:int:range(1, 10)}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'page',
          optional: false,
          wildcard: false,
          constraints: [
            { type: 'int', params: '' },
            { type: 'range', params: '1, 10' },
          ],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize parameter constraint with trimmed params', () => {
      const path = '/{page:range( 1, 10 )}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'page',
          optional: false,
          wildcard: false,
          constraints: [{ type: 'range', params: '1, 10' }],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize parameter constraint with nested parentheses', () => {
      const path = '/{id:regex(([0-9]+))}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'id',
          optional: false,
          wildcard: false,
          constraints: [{ type: 'regex', params: '([0-9]+)' }],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize optional constrained parameter segment', () => {
      const path = '/{page:range(1, 10)?}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'page',
          optional: true,
          wildcard: false,
          constraints: [{ type: 'range', params: '1, 10' }],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });
  });

  describe('nested segments', () => {
    it('tokenize simple nested segments types', () => {
      const path = '/say/{message}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        {
          type: 'literal',
          value: '/say/',
        },
        {
          type: 'parameter',
          name: 'message',
          optional: false,
          wildcard: false,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize file path like pattern', () => {
      const path = 'c://{name}.{ext}';
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual([
        {
          type: 'literal',
          value: 'c://',
        },
        {
          type: 'parameter',
          name: 'name',
          optional: false,
          wildcard: false,
          constraints: [],
        },
        {
          type: 'literal',
          value: '.',
        },
        {
          type: 'parameter',
          name: 'ext',
          optional: false,
          wildcard: false,
          constraints: [],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });
  });

  describe('segment escaping', () => {
    const paths: [path: string, expectations: (RouteSegment | ParameterSegment)[]][] = [
      [
        '/path/with/\\{literal_braces\\}',
        [
          {
            type: 'literal',
            value: '/path/with/\\{literal_braces\\}',
          },
        ],
      ],
      [
        '/path/with/{paramName:regex(/([0-9]+)/)}',
        [
          {
            type: 'literal',
            value: '/path/with/',
          },
          {
            type: 'parameter',
            name: 'paramName',
            optional: false,
            wildcard: false,
            constraints: [
              {
                type: 'regex',
                params: '/([0-9]+)/',
              },
            ],
          },
        ],
      ],
      [
        '/path/with/{paramName:regex(/(/d+)/)}',
        [
          {
            type: 'literal',
            value: '/path/with/',
          },
          {
            type: 'parameter',
            name: 'paramName',
            optional: false,
            wildcard: false,
            constraints: [
              {
                type: 'regex',
                params: '/(/d+)/',
              },
            ],
          },
        ],
      ],
    ];

    it.each(paths)('escapes "%s" accordingly', (path, expectation) => {
      const parser = new Parser(lexer(path), path);

      expect(parser.parseAST()).toStrictEqual(expectation);
    });
  });

  describe('error', () => {
    it.each([
      '/path/with/{*wildcard\\*}',
      '/path/with/{param\\:Name}',
      '/path/with/{*wildcard\\*}',
    ] satisfies string[])(
      'throws error on route pattern "%s" due to not closed parameter',
      (path) => {
        const parser = new Parser(lexer(path), path);

        expect(() => parser.parseAST()).toThrow('Expected closing brace "}"');
      },
    );

    it('throws error on unexpected end of input', () => {
      const path = '/say/{message}';
      const parser = new Parser([], path);

      expect(() => parser.parseAST()).toThrow(
        "[Parser] Unexpected end of input on '/say/{message}'.",
      );
    });

    it('throws error when consuming an unexpected token type', () => {
      const path = '/say/{message}';
      const parser = new Parser(
        [
          {
            type: 'CloseBrace',
            position: 0,
          },
        ],
        path,
      );

      expect(() => {
        // @ts-expect-error: accessing private method for defensive branch coverage
        parser.consume('Identifier');
      }).toThrow('[Parser] Expected token type Identifier, but got CloseBrace');
    });

    it('throws error when identifier token has no value', () => {
      const path = '/{}';
      const parser = new Parser(
        [
          {
            type: 'OpenBrace',
            position: 0,
          },
          {
            type: 'Identifier',
            position: 1,
          },
          {
            type: 'CloseBrace',
            position: 2,
          },
          {
            type: 'EndOfInput',
            position: 3,
          },
        ],
        path,
      );

      expect(() => parser.parseAST()).toThrow("[Parser] Missing identifier value on '/{}'.");
    });

    it('throws error on not closed constraint parameter', () => {
      const path = '/say/{message:int(}';
      const parser = new Parser(lexer(path), path);

      expect(() => parser.parseAST()).toThrow(
        "Unclosed constraint parameters found on '/say/{message:int(}'",
      );
    });

    it('throws error when constraint is missing closing parenthesis', () => {
      const path = '/say/{message:int(abc}';
      const parser = new Parser(
        [
          {
            type: 'OpenBrace',
            position: 5,
          },
          {
            type: 'Identifier',
            value: 'message',
            position: 6,
          },
          {
            type: 'Colon',
            position: 13,
          },
          {
            type: 'Identifier',
            value: 'int',
            position: 14,
          },
          {
            type: 'LeftParen',
            position: 17,
          },
          {
            type: 'Identifier',
            value: 'abc',
            position: 18,
          },
          {
            type: 'RightParen',
            position: 21,
          },
          {
            type: 'CloseBrace',
            position: 22,
          },
          {
            type: 'EndOfInput',
            position: 23,
          },
        ],
        path,
      );

      // Force the defensive branch after parseConstraintParams returns.
      // @ts-expect-error: accessing private method for defensive branch coverage
      parser.parseConstraintParams = () => {
        // @ts-expect-error: accessing private field for defensive branch coverage
        parser.position = 7;

        return 'abc';
      };

      expect(() => parser.parseAST()).toThrow(
        "[Parser] Expected closing parenthesis ')' on '/say/{message:int(abc}'.",
      );
    });

    it('throws error when constraint params are parsed without opening parenthesis', () => {
      const path = '/say/{message:int()}';
      const parser = new Parser(lexer(path), path);

      expect(() => {
        // @ts-expect-error: accessing private method for defensive branch coverage
        parser.parseConstraintParams();
      }).toThrow("[Parser] Missing opening parenthesis on '/say/{message:int()}'.");
    });

    it('throws error on malformed parameter signature', () => {
      const path = '/say/{}';
      const parser = new Parser(lexer(path), path);

      expect(() => parser.parseAST()).toThrow(
        "Missing parameter name found on '/say/{}'. Please provide a valid name.",
      );
    });

    it('throws error on invalid constraint', () => {
      const path = '/say/{message:int:()}';
      const parser = new Parser(lexer(path), path);

      expect(() => parser.parseAST()).toThrow(
        "Missing constraint type found on '/say/{message:int:()}'. Please enter a valid constraint type to proceed.",
      );
    });

    it('throws error on duplicated parameter name', () => {
      const path = '/say/{message}/{message}';
      const parser = new Parser(lexer(path), path);

      expect(() => parser.parseAST()).toThrow(
        "Duplicate parameter 'message' found in the route '/say/{message}/{message}'." +
          ' Each parameter must have a unique name.',
      );
    });
  });

  describe('defensive branches', () => {
    it('skips literal segment when token value resolves to empty string', () => {
      const path = '/empty';
      const parser = new Parser(
        [
          {
            type: 'Identifier',
            position: 0,
          },
          {
            type: 'EndOfInput',
            position: 1,
          },
        ],
        path,
      );

      expect(parser.parseAST()).toStrictEqual([]);
    });

    it('returns empty string for unknown token value', () => {
      const path = '/unknown';
      const parser = new Parser(
        [
          {
            type: 'Unknown',
            position: 0,
          } as unknown as Token,
          {
            type: 'EndOfInput',
            position: 1,
          },
        ],
        path,
      );

      expect(parser.parseAST()).toStrictEqual([]);
    });
  });
});
