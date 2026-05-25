import type {
  Constraint,
  ConstraintValidation,
  LiteralSegment,
  MatchedParam,
  ParameterSegment,
  RouteSegment,
  Token,
  TokenType,
  TypeOrArray,
} from './contracts';

describe('types', () => {
  describe('TypeOrArray', () => {
    it('should accept a single value', () => {
      expectTypeOf<string>().toExtend<TypeOrArray<string>>();
    });

    it('should accept an array of values', () => {
      expectTypeOf<string[]>().toExtend<TypeOrArray<string>>();
    });
  });

  describe('LiteralSegment', () => {
    it('should accept a literal segment without value', () => {
      expectTypeOf<{
        type: 'literal';
      }>().toExtend<LiteralSegment>();
    });

    it('should accept a literal segment with value', () => {
      expectTypeOf<{
        type: 'literal';
        value: string;
      }>().toExtend<LiteralSegment>();
    });

    it('should require literal type', () => {
      expectTypeOf<LiteralSegment['type']>().toEqualTypeOf<'literal'>();
    });
  });

  describe('ParameterSegment', () => {
    it('should accept a parameter segment', () => {
      expectTypeOf<{
        type: 'parameter';
        name: string;
        wildcard: boolean;
        optional: boolean;
        constraints: readonly Constraint[];
      }>().toExtend<ParameterSegment>();
    });

    it('should accept a parameter segment with value', () => {
      expectTypeOf<{
        type: 'parameter';
        name: string;
        value: string;
        wildcard: boolean;
        optional: boolean;
        constraints: readonly Constraint[];
      }>().toExtend<ParameterSegment>();
    });

    it('should require parameter type', () => {
      expectTypeOf<ParameterSegment['type']>().toEqualTypeOf<'parameter'>();
    });

    it('should require readonly constraints', () => {
      expectTypeOf<ParameterSegment['constraints']>().toEqualTypeOf<readonly Constraint[]>();
    });
  });

  describe('RouteSegment', () => {
    it('should accept a literal segment', () => {
      expectTypeOf<LiteralSegment>().toExtend<RouteSegment>();
    });

    it('should accept a parameter segment', () => {
      expectTypeOf<ParameterSegment>().toExtend<RouteSegment>();
    });

    it('should expose literal and parameter segment types', () => {
      expectTypeOf<RouteSegment['type']>().toEqualTypeOf<'literal' | 'parameter'>();
    });
  });

  describe('TokenType', () => {
    it('should accept all token types', () => {
      expectTypeOf<TokenType>().toEqualTypeOf<
        | 'Literal'
        | 'OpenBrace'
        | 'CloseBrace'
        | 'Colon'
        | 'QuestionMark'
        | 'Asterisk'
        | 'Identifier'
        | 'Comma'
        | 'LeftParen'
        | 'RightParen'
        | 'EscapedChar'
        | 'EndOfInput'
      >();
    });
  });

  describe('Token', () => {
    it('should accept a token without value', () => {
      expectTypeOf<{
        type: 'EndOfInput';
        position: number;
      }>().toExtend<Token>();
    });

    it('should accept a token with value', () => {
      expectTypeOf<{
        type: 'Literal';
        value: string;
        position: number;
      }>().toExtend<Token>();
    });

    it('should require token type', () => {
      expectTypeOf<Token['type']>().toEqualTypeOf<TokenType>();
    });

    it('should require token position', () => {
      expectTypeOf<Token['position']>().toEqualTypeOf<number>();
    });
  });

  describe('Constraint', () => {
    it('should accept a constraint', () => {
      expectTypeOf<{
        type: string;
        params: string;
      }>().toExtend<Constraint>();
    });

    it('should require constraint type', () => {
      expectTypeOf<Constraint['type']>().toEqualTypeOf<string>();
    });

    it('should require constraint params', () => {
      expectTypeOf<Constraint['params']>().toEqualTypeOf<string>();
    });
  });

  describe('ConstraintValidation', () => {
    it('should accept a constraint validation function', () => {
      const validation: ConstraintValidation = Object.assign(() => undefined, {
        verify: () => undefined,
        toRegExp: () => '.*',
      });

      expectTypeOf(validation).toEqualTypeOf<ConstraintValidation>();
    });

    it('should require a validation call signature', () => {
      expectTypeOf<ConstraintValidation>().parameter(0).toEqualTypeOf<string>();
      expectTypeOf<ConstraintValidation>()
        .parameter(1)
        .toEqualTypeOf<string | number | boolean | undefined>();
      expectTypeOf<ConstraintValidation>().parameter(2).toEqualTypeOf<string>();

      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      expectTypeOf<ConstraintValidation>().returns.toEqualTypeOf<void>();
    });

    it('should require verify method', () => {
      expectTypeOf<ConstraintValidation['verify']>().parameters.toEqualTypeOf<
        [paramName: string, params: string]
      >();

      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      expectTypeOf<ConstraintValidation['verify']>().returns.toEqualTypeOf<void>();
    });

    it('should require toRegExp method', () => {
      expectTypeOf<ConstraintValidation['toRegExp']>().parameters.toEqualTypeOf<[params: string]>();

      expectTypeOf<ConstraintValidation['toRegExp']>().returns.toEqualTypeOf<string>();
    });
  });

  describe('MatchedParam', () => {
    it('should accept string params', () => {
      expectTypeOf<{
        slug: string;
      }>().toExtend<MatchedParam>();
    });

    it('should accept string array params', () => {
      expectTypeOf<{
        slug: string[];
      }>().toExtend<MatchedParam>();
    });

    it('should accept null params', () => {
      expectTypeOf<{
        slug: null;
      }>().toExtend<MatchedParam>();
    });

    it('should accept undefined params', () => {
      expectTypeOf<{
        slug: undefined;
      }>().toExtend<MatchedParam>();
    });

    it('should accept mixed params', () => {
      expectTypeOf<{
        id: string;
        path: string[];
        optional: null;
        missing: undefined;
      }>().toExtend<MatchedParam>();
    });
  });
});
