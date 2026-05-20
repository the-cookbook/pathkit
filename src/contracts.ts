type TypeOrArray<T> = T | T[];

interface LiteralSegment {
  type: 'literal';
  value?: string;
}

interface ParameterSegment {
  type: 'parameter';
  name: string;
  value?: string;
  wildcard: boolean;
  optional: boolean;
  constraints: readonly Constraint[];
}

type RouteSegment = LiteralSegment | ParameterSegment;

type TokenType =
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
  | 'EndOfInput';

interface Token {
  type: TokenType;
  value?: string;
  position: number;
}

interface Constraint {
  type: string;
  params: string;
}

interface ConstraintValidation {
  (paramName: string, value: string | number | boolean | undefined, params: string): void;

  // eslint-disable-next-line  @typescript-eslint/no-invalid-void-type
  verify(this: void, paramName: string, params: string): void;

  // eslint-disable-next-line  @typescript-eslint/no-invalid-void-type
  toRegExp(this: void, params: string): string;
}

type MatchedParam = Record<string, string | string[] | null | undefined>;

export type {
  TypeOrArray,
  RouteSegment,
  LiteralSegment,
  ParameterSegment,
  TokenType,
  Token,
  Constraint,
  ConstraintValidation,
  MatchedParam,
};
