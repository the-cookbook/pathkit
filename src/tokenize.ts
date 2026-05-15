import lexer from './lexer';
import Parser from './parser';
import type { RouteSegment } from './contracts';

const tokenize = (route: string): readonly RouteSegment[] => {
  const tokens = lexer(route);
  const parser = new Parser(tokens, route);

  try {
    return parser.parseAST();
  } catch (e) {
    throw new Error(`[Tokenize] Invalid route pattern: ${(e as Error).message}`);
  }
};

export default tokenize;
