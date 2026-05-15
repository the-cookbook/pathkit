import Parser from './parser';
import lexer from './lexer';
import type { RouteSegment, ParameterSegment } from './contracts';

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

    it('throws error on not closed constraint parameter', () => {
      const path = '/say/{message:int(}';
      const parser = new Parser(lexer(path), path);

      expect(() => parser.parseAST()).toThrow(
        "Unclosed constraint parameters found on '/say/{message:int(}'",
      );
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
});
