import tokenize from './tokenize';
import validateConstraints from './validate-constraints';
import escapeRegex from './utils/escape-regex';
import { is } from './utils/is';
import { isLiteralToken, isParameterToken } from './utils/segment-filters';
import * as constraintMethods from './constraints';
import type { RouteSegment, ParameterSegment, MatchedParam } from './contracts';

interface MatchOptions {
  delimiter?: string;
  trailing?: boolean;
}

const defaultOptions: Required<MatchOptions> = {
  delimiter: '/',
  trailing: true,
};

type ConstraintType = keyof typeof constraintMethods;

const isConstraintType = (type: string): type is ConstraintType => type in constraintMethods;

const getParamPattern = (paramSegment: ParameterSegment): string => {
  if (!paramSegment.constraints.length) {
    return paramSegment.wildcard ? '.*' : '[^/]+';
  }

  let paramPattern = '';

  for (const constraint of paramSegment.constraints) {
    if (!isConstraintType(constraint.type)) {
      paramPattern = '[^/]+';
      continue;
    }

    const constraintRegExp = constraintMethods[constraint.type].toRegExp(constraint.params);

    if (constraintRegExp) {
      paramPattern = constraintRegExp;
      continue;
    }

    paramPattern = '[^/]+';
  }

  return paramPattern;
};

const buildRegexFromRoute = (
  segments: readonly RouteSegment[],
  options: MatchOptions = {},
): { pattern: RegExp; paramNames: string[] } => {
  const { delimiter, trailing } = { ...defaultOptions, ...options };
  const paramNames: string[] = [];
  const regexParts: string[] = [];
  const ROUTE_DELIMITER = new RegExp(`${delimiter}$`);

  for (const [i, segment] of segments.entries()) {
    if (isParameterToken(segment)) {
      const paramName = segment.name;

      paramNames.push(paramName);

      const paramPattern = getParamPattern(segment);

      if (segment.optional) {
        let precedingLiteral = '';

        const previousSegment = segments[i - 1];

        if (previousSegment && isLiteralToken(previousSegment) && previousSegment.value) {
          precedingLiteral = escapeRegex(previousSegment.value.replace(ROUTE_DELIMITER, ''));
          regexParts.pop();
        }

        if (!regexParts.length) {
          regexParts.push(`${precedingLiteral}${delimiter}?(?<${paramName}>${paramPattern})?`);
          continue;
        }

        regexParts.push(`(?:${precedingLiteral}${delimiter}?)(?<${paramName}>${paramPattern})?`);
        continue;
      }

      regexParts.push(`(?<${paramName}>${paramPattern})`);
      continue;
    }

    if (isLiteralToken(segment) && segment.value) {
      regexParts.push(escapeRegex(segment.value));
    }
  }

  if (trailing) {
    regexParts.push(`${delimiter}?`);
  }

  const pattern = new RegExp(`^${regexParts.join('')}$`);

  return { pattern, paramNames };
};

const match = (route: string, options: MatchOptions = {}) => {
  const segments = tokenize(route);
  const parameterSegments = segments.filter(isParameterToken);
  const { pattern, paramNames } = buildRegexFromRoute(segments, options);

  return (path: string): { match: boolean; params: MatchedParam | null } => {
    const result = pattern.exec(path);

    if (!result) {
      return {
        match: false,
        params: null,
      };
    }

    const params: MatchedParam = {};

    for (const paramName of paramNames) {
      const value = result.groups?.[paramName];

      const paramSegment = parameterSegments.find((token) => token.name === paramName);

      if (!paramSegment) {
        continue;
      }

      if (!is.nullish(value)) {
        try {
          validateConstraints(paramName, value, paramSegment.constraints);
          params[paramName] = value;
        } catch {
          return {
            match: false,
            params: null,
          };
        }
      }
    }

    return {
      match: true,
      params,
    };
  };
};

export type { MatchOptions };
export default match;
