import type { TokenType } from '../contracts';
import { charToTokenType, tokenTypeCharList, tokenTypeToChar } from './token';

describe('token', () => {
  describe('tokenTypeToChar', () => {
    it('should map OpenBrace token to character', () => {
      expect(tokenTypeToChar.OpenBrace).toBe('{');
    });

    it('should map CloseBrace token to character', () => {
      expect(tokenTypeToChar.CloseBrace).toBe('}');
    });

    it('should map Colon token to character', () => {
      expect(tokenTypeToChar.Colon).toBe(':');
    });

    it('should map QuestionMark token to character', () => {
      expect(tokenTypeToChar.QuestionMark).toBe('?');
    });

    it('should map Asterisk token to character', () => {
      expect(tokenTypeToChar.Asterisk).toBe('*');
    });

    it('should map Comma token to character', () => {
      expect(tokenTypeToChar.Comma).toBe(',');
    });

    it('should map LeftParen token to character', () => {
      expect(tokenTypeToChar.LeftParen).toBe('(');
    });

    it('should map RightParen token to character', () => {
      expect(tokenTypeToChar.RightParen).toBe(')');
    });

    it('should map EscapedChar token to character', () => {
      expect(tokenTypeToChar.EscapedChar).toBe('\\');
    });

    it('should include all character-backed token types', () => {
      expect(tokenTypeToChar).toEqual({
        OpenBrace: '{',
        CloseBrace: '}',
        Colon: ':',
        QuestionMark: '?',
        Asterisk: '*',
        Comma: ',',
        LeftParen: '(',
        RightParen: ')',
        EscapedChar: '\\',
      });
    });

    it('should not include value-backed or terminal token types', () => {
      expect(tokenTypeToChar).not.toHaveProperty('Literal');
      expect(tokenTypeToChar).not.toHaveProperty('Identifier');
      expect(tokenTypeToChar).not.toHaveProperty('EndOfInput');
    });

    it('should expose the expected token map type', () => {
      expectTypeOf(tokenTypeToChar).toEqualTypeOf<
        Omit<Record<TokenType, string>, 'Literal' | 'Identifier' | 'EndOfInput'>
      >();
    });
  });

  describe('charToTokenType', () => {
    it('should map open brace character to token type', () => {
      expect(charToTokenType['{']).toBe('OpenBrace');
    });

    it('should map close brace character to token type', () => {
      expect(charToTokenType['}']).toBe('CloseBrace');
    });

    it('should map colon character to token type', () => {
      expect(charToTokenType[':']).toBe('Colon');
    });

    it('should map question mark character to token type', () => {
      expect(charToTokenType['?']).toBe('QuestionMark');
    });

    it('should map asterisk character to token type', () => {
      expect(charToTokenType['*']).toBe('Asterisk');
    });

    it('should map comma character to token type', () => {
      expect(charToTokenType[',']).toBe('Comma');
    });

    it('should map left parenthesis character to token type', () => {
      expect(charToTokenType['(']).toBe('LeftParen');
    });

    it('should map right parenthesis character to token type', () => {
      expect(charToTokenType[')']).toBe('RightParen');
    });

    it('should map backslash character to escaped char token type', () => {
      expect(charToTokenType['\\']).toBe('EscapedChar');
    });

    it('should include reverse mapping for every token character', () => {
      expect(charToTokenType).toEqual({
        '{': 'OpenBrace',
        '}': 'CloseBrace',
        ':': 'Colon',
        '?': 'QuestionMark',
        '*': 'Asterisk',
        ',': 'Comma',
        '(': 'LeftParen',
        ')': 'RightParen',
        '\\': 'EscapedChar',
      });
    });

    it('should not map unsupported characters', () => {
      expect(charToTokenType.a).toBeUndefined();
      expect(charToTokenType['/']).toBeUndefined();
      expect(charToTokenType['.']).toBeUndefined();
    });

    it('should be the inverse of tokenTypeToChar', () => {
      for (const [tokenType, char] of Object.entries(tokenTypeToChar)) {
        expect(charToTokenType[char]).toBe(tokenType);
      }
    });

    it('should expose the expected reverse token map type', () => {
      expectTypeOf(charToTokenType).toEqualTypeOf<Record<string, keyof typeof tokenTypeToChar>>();
    });
  });

  describe('tokenTypeCharList', () => {
    it('should include every token character', () => {
      expect(tokenTypeCharList).toEqual(['{', '}', ':', '?', '*', ',', '(', ')', '\\']);
    });

    it('should match tokenTypeToChar values', () => {
      expect(tokenTypeCharList).toEqual(Object.values(tokenTypeToChar));
    });

    it('should contain unique characters only', () => {
      expect(new Set(tokenTypeCharList).size).toBe(tokenTypeCharList.length);
    });

    it('should contain only characters that can be resolved back to token types', () => {
      for (const char of tokenTypeCharList) {
        expect(charToTokenType[char]).toBeDefined();
      }
    });

    it('should expose the expected token character list type', () => {
      expectTypeOf(tokenTypeCharList).toEqualTypeOf<string[]>();
    });
  });
});
