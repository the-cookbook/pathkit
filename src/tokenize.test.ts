import tokenize from './tokenize';
import type { ParameterSegment, RouteSegment } from './contracts';

describe('tokenize', () => {
  describe('literal segments', () => {
    it('tokenize single literal segment', () => {
      const path = '/segment';

      expect(tokenize(path)).toStrictEqual([
        { type: 'literal', value: '/segment' },
      ] satisfies RouteSegment[]);
    });

    it('tokenize multiple literal segment', () => {
      const path = '/first/second';

      expect(tokenize(path)).toStrictEqual([
        { type: 'literal', value: '/first/second' },
      ] satisfies RouteSegment[]);
    });

    it('tokenize empty route pattern', () => {
      const path = '';

      expect(tokenize(path)).toStrictEqual([] satisfies RouteSegment[]);
    });

    it('tokenize literal segment with reserved characters escaped', () => {
      const path = '/path/with/\\{literal_braces\\}';

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

    it('tokenize optional constrained parameter segment', () => {
      const path = '/{lang?}/articles/{id:int?}';

      expect(tokenize(path)).toStrictEqual([
        { type: 'literal', value: '/' },
        {
          type: 'parameter',
          name: 'lang',
          optional: true,
          wildcard: false,
          constraints: [],
        },
        { type: 'literal', value: '/articles/' },
        {
          type: 'parameter',
          name: 'id',
          optional: true,
          wildcard: false,
          constraints: [
            {
              type: 'int',
              params: '',
            },
          ],
        },
      ] satisfies (ParameterSegment | RouteSegment)[]);
    });

    it('tokenize optional wildcard parameter segment', () => {
      const path = '/{*path?}';

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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

      expect(tokenize(path)).toStrictEqual([
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
      expect(tokenize(path)).toStrictEqual(expectation);
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
        expect(() => tokenize(path)).toThrow('Expected closing brace "}"');
      },
    );

    it('throws error when identifier token has no value', () => {
      const path = '/{}';

      expect(() => tokenize(path)).toThrow(
        "[Tokenize] Invalid route pattern: [Parser] Missing parameter name found on '/{}'.",
      );
    });

    it('throws error on not closed constraint parameter', () => {
      const path = '/say/{message:int(}';

      expect(() => tokenize(path)).toThrow(
        "Unclosed constraint parameters found on '/say/{message:int(}'",
      );
    });

    it('throws error when constraint is missing closing parenthesis', () => {
      const path = '/say/{message:int(abc}';

      expect(() => tokenize(path)).toThrow(
        "[Tokenize] Invalid route pattern: [Parse] Unclosed constraint parameters found on '/say/{message:int(abc}'.",
      );
    });

    it('throws error on malformed parameter signature', () => {
      const path = '/say/{}';

      expect(() => tokenize(path)).toThrow(
        "Missing parameter name found on '/say/{}'. Please provide a valid name.",
      );
    });

    it('throws error on invalid constraint', () => {
      const path = '/say/{message:int:()}';

      expect(() => tokenize(path)).toThrow(
        "Missing constraint type found on '/say/{message:int:()}'. Please enter a valid constraint type to proceed.",
      );
    });

    it('throws error on duplicated parameter name', () => {
      const path = '/say/{message}/{message}';

      expect(() => tokenize(path)).toThrow(
        "Duplicate parameter 'message' found in the route '/say/{message}/{message}'." +
          ' Each parameter must have a unique name.',
      );
    });
  });
});
