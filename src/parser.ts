import { tokenTypeToChar } from './utils/token';
import type { Constraint, ParameterSegment, RouteSegment, Token, TokenType } from './contracts';

class Parser {
  private readonly tokens: Token[];

  private readonly route: string;

  private position = 0;

  constructor(tokens: Token[], route: string) {
    this.tokens = tokens;
    this.route = route;
  }

  private peek(): Token {
    const token = this.tokens[this.position];

    if (!token) {
      throw new Error(`[Parser] Unexpected end of input on '${this.route}'.`);
    }

    return token;
  }

  private consume(expectedType?: TokenType): Token {
    const token = this.peek();

    if (expectedType && token.type !== expectedType) {
      throw new Error(`[Parser] Expected token type ${expectedType}, but got ${token.type}`);
    }

    this.position += 1;

    return token;
  }

  private consumeIdentifier(): string {
    const token = this.consume('Identifier');

    if (!token.value) {
      throw new Error(`[Parser] Missing identifier value on '${this.route}'.`);
    }

    return token.value;
  }

  private parseParameterSegment(): ParameterSegment {
    const constraints: Constraint[] = [];
    let wildcard = false;
    let name = '';
    let optional = false;

    if (this.peek().type === 'Asterisk') {
      wildcard = true;
      this.consume('Asterisk');
    }

    if (this.peek().type === 'Identifier') {
      name = this.consumeIdentifier();
    } else {
      throw new Error(
        `[Parser] Missing parameter name found on '${this.route}'. Please provide a valid name.`,
      );
    }

    while (this.peek().type === 'Colon') {
      this.consume('Colon');
      constraints.push(this.parseConstraint());
    }

    if (this.peek().type === 'QuestionMark') {
      optional = true;
      this.consume('QuestionMark');
    }

    if (this.peek().type !== 'CloseBrace') {
      throw new Error(`[Parser] Expected closing brace "}" on '${this.route}'`);
    }

    this.consume('CloseBrace');

    return {
      type: 'parameter',
      name,
      wildcard,
      optional,
      constraints,
    };
  }

  private parseConstraint(): Constraint {
    if (this.peek().type !== 'Identifier') {
      throw new Error(
        `[Parser] Missing constraint type found on '${this.route}'. Please enter a valid constraint type to proceed.`,
      );
    }

    const type = this.consumeIdentifier();
    let params = '';

    if (this.peek().type === 'LeftParen') {
      this.consume('LeftParen');

      params = this.parseConstraintParams();

      if (this.peek().type !== 'RightParen') {
        throw new Error(`[Parser] Expected closing parenthesis ')' on '${this.route}'.`);
      }

      this.consume('RightParen');
    }

    return { type, params };
  }

  private parseConstraintParams(): string {
    const startToken = this.tokens[this.position - 1];

    if (!startToken) {
      throw new Error(`[Parser] Missing opening parenthesis on '${this.route}'.`);
    }

    const start = startToken.position + 1;
    let nesting = 1;
    let end = start;

    while (this.position < this.tokens.length) {
      const token = this.peek();

      if (token.type === 'LeftParen') {
        nesting += 1;
      }

      if (token.type === 'RightParen') {
        nesting -= 1;

        if (nesting === 0) {
          end = token.position;
          break;
        }
      }

      this.position += 1;
    }

    if (nesting !== 0) {
      throw new Error(`[Parse] Unclosed constraint parameters found on '${this.route}'.`);
    }

    return this.route.substring(start, end).trim();
  }

  private getTokenValue(token: Token): string {
    switch (token.type) {
      case 'Colon':
      case 'QuestionMark':
      case 'Asterisk':
      case 'Comma':
      case 'LeftParen':
      case 'RightParen':
      case 'OpenBrace':
      case 'CloseBrace':
        return tokenTypeToChar[token.type];

      case 'EscapedChar':
      case 'Identifier':
        return token.value ?? '';

      default:
        return '';
    }
  }

  public parseAST(): RouteSegment[] {
    const segments: RouteSegment[] = [];

    while (this.peek().type !== 'EndOfInput') {
      if (this.peek().type === 'OpenBrace') {
        this.consume('OpenBrace');

        const segment = this.parseParameterSegment();
        const isSegmentDuplicated = segments
          .filter((entry) => entry.type === 'parameter')
          .some((entry) => entry.name === segment.name);

        if (isSegmentDuplicated) {
          throw Error(
            `[Parser] Duplicate parameter '${segment.name}' found in the route '${this.route}'. ` +
              'Each parameter must have a unique name.',
          );
        }

        segments.push(segment);

        continue;
      }

      let value = '';

      while (this.peek().type !== 'OpenBrace' && this.peek().type !== 'EndOfInput') {
        const token = this.consume();

        value += this.getTokenValue(token);
      }

      if (value) {
        segments.push({ type: 'literal', value });
      }
    }

    return segments;
  }
}

export default Parser;
