import { describe, expect, expectTypeOf, it } from 'vitest';

import * as contracts from './contracts';
import * as constraintExports from './constraints';
import * as index from './index';

import type { CompileOptions as SourceCompileOptions } from './compile';
import type { MatchOptions as SourceMatchOptions } from './match';

import type {
  CompileOptions,
  Constraint,
  ConstraintValidation,
  LiteralSegment,
  MatchOptions,
  MatchedParam,
  ParameterSegment,
  RouteSegment,
  Token,
  TokenType,
} from './index';

describe('index', () => {
  it('should export compile', () => {
    expect(index.compile).toEqual(expect.any(Function));
  });

  it('should export match', () => {
    expect(index.match).toEqual(expect.any(Function));
  });

  it('should export tokenize', () => {
    expect(index.tokenize).toEqual(expect.any(Function));
  });

  it('should export validateRoute', () => {
    expect(index.validateRoute).toEqual(expect.any(Function));
  });

  it('should export constraints namespace', () => {
    expect(index.constraints).toBeDefined();
    expect(index.constraints).toEqual(expect.objectContaining(constraintExports));
  });

  it('should export named constraints', () => {
    for (const exportName of Object.keys(constraintExports)) {
      expect(index).toHaveProperty(exportName);
    }
  });

  it('should export CompileOptions type', () => {
    expectTypeOf<CompileOptions>().toEqualTypeOf<SourceCompileOptions>();
  });

  it('should export MatchOptions type', () => {
    expectTypeOf<MatchOptions>().toEqualTypeOf<SourceMatchOptions>();
  });

  it('should export Constraint type', () => {
    expectTypeOf<Constraint>().toEqualTypeOf<contracts.Constraint>();
  });

  it('should export ConstraintValidation type', () => {
    expectTypeOf<ConstraintValidation>().toEqualTypeOf<contracts.ConstraintValidation>();
  });

  it('should export LiteralSegment type', () => {
    expectTypeOf<LiteralSegment>().toEqualTypeOf<contracts.LiteralSegment>();
  });

  it('should export MatchedParam type', () => {
    expectTypeOf<MatchedParam>().toEqualTypeOf<contracts.MatchedParam>();
  });

  it('should export ParameterSegment type', () => {
    expectTypeOf<ParameterSegment>().toEqualTypeOf<contracts.ParameterSegment>();
  });

  it('should export RouteSegment type', () => {
    expectTypeOf<RouteSegment>().toEqualTypeOf<contracts.RouteSegment>();
  });

  it('should export Token type', () => {
    expectTypeOf<Token>().toEqualTypeOf<contracts.Token>();
  });

  it('should export TokenType type', () => {
    expectTypeOf<TokenType>().toEqualTypeOf<contracts.TokenType>();
  });
});
