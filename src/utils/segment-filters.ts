import type { LiteralSegment, ParameterSegment } from '../contracts';

const isParameterToken = (token: LiteralSegment | ParameterSegment): token is ParameterSegment =>
  token.type === 'parameter';

const isLiteralToken = (token: LiteralSegment | ParameterSegment): token is LiteralSegment =>
  token.type === 'literal';

export { isLiteralToken, isParameterToken };
