import type { TokenType } from '../contracts';

const tokenTypeToChar: Omit<Record<TokenType, string>, 'Literal' | 'Identifier' | 'EndOfInput'> = {
  OpenBrace: '{',
  CloseBrace: '}',
  Colon: ':',
  QuestionMark: '?',
  Asterisk: '*',
  Comma: ',',
  LeftParen: '(',
  RightParen: ')',
  EscapedChar: '\\',
};

const charToTokenType: Record<string, keyof typeof tokenTypeToChar> = Object.entries(
  tokenTypeToChar,
).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

const tokenTypeCharList = Object.values(tokenTypeToChar);

export { tokenTypeToChar, charToTokenType, tokenTypeCharList };
