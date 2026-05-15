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

interface Constraint {
  type: string;
  params: string;
}

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

type ConstraintValidation = ((
  paramName: string,
  value: string | number | boolean | undefined,
  params: Constraint['params'],
) => void) & {
  verify: (paramName: string, params: Constraint['params']) => void;
  toRegExp: (params: Constraint['params']) => string;
};

type MatchedParam = Record<string, string | string[] | null>;

export type {
  TypeOrArray,
  RouteSegment,
  LiteralSegment,
  ParameterSegment,
  Constraint,
  TokenType,
  Token,
  ConstraintValidation,
  MatchedParam,
};
