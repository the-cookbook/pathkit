import { charToTokenType, tokenTypeCharList } from './utils/token';
import type { Token } from './contracts';

const lexer = (route: string): Token[] => {
  const tokens: Token[] = [];
  const { length } = route;
  let i = 0;

  while (i < length) {
    const iterationSafeguard = i;
    const char = route[i];

    if (!char) {
      throw new Error(`[Lexer] Unexpected empty character at index ${String(i)}`);
    }

    const match = charToTokenType[char];

    switch (match) {
      case 'EscapedChar': {
        const escapedChar = route[i + 1];

        if (escapedChar) {
          tokens.push({
            type: 'EscapedChar',
            value: `\\${escapedChar}`,
            position: i,
          });

          i += 2;
          break;
        }

        throw new Error(
          `[Lexer] Unexpected end of input after escape character at index ${String(i + 1)}`,
        );
      }

      default: {
        if (match) {
          tokens.push({ type: match, position: i });
          i += 1;
          break;
        }

        let value = '';
        const startPos = i;

        while (i < length) {
          const currentChar = route[i];

          if (!currentChar || tokenTypeCharList.includes(currentChar)) {
            break;
          }

          value += currentChar;
          i += 1;
        }

        tokens.push({ type: 'Identifier', value, position: startPos });
        break;
      }
    }

    if (i === iterationSafeguard) {
      const currentChar = route[i] ?? '';

      throw new Error(
        `[Lexer] Infinite loop detected: index 'i' did not increment at position ${String(
          i,
        )}. Current character: '${currentChar}'`,
      );
    }
  }

  tokens.push({ type: 'EndOfInput', position: i });

  return tokens;
};

export default lexer;
