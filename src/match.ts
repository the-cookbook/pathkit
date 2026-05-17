import tokenize from './tokenize';
import validateConstraints from './validate-constraints';
import escapeRegex from './utils/escape-regex';
import { getRegisteredConstraint } from './utils/get-constraint';
import { is } from './utils/is';
import { isLiteralToken, isParameterToken } from './utils/segment-filters';
import type { MatchedParam, ParameterSegment, RouteSegment } from './contracts';

interface MatchOptions {
  delimiter?: string;
  trailing?: boolean;
  strict?: boolean;
}

const defaultOptions: Required<MatchOptions> = {
  delimiter: '/',
  trailing: true,
  strict: false,
};

const getDefaultParamPattern = (paramSegment: ParameterSegment): string => {
  if (paramSegment.wildcard) {
    return '.*';
  }

  return '[^/]+';
};

const getParamPattern = (paramSegment: ParameterSegment): string => {
  if (!paramSegment.constraints.length) {
    return getDefaultParamPattern(paramSegment);
  }

  for (const constraint of paramSegment.constraints) {
    const validator = getRegisteredConstraint(constraint.type);

    if (!validator) {
      continue;
    }

    const constraintRegExp = validator.toRegExp(constraint.params);

    if (constraintRegExp) {
      return constraintRegExp;
    }
  }

  return getDefaultParamPattern(paramSegment);
};

const buildRegexFromRoute = (
  segments: readonly RouteSegment[],
  options: MatchOptions = {},
): { pattern: RegExp; paramNames: string[] } => {
  const { delimiter, trailing } = { ...defaultOptions, ...options };
  const paramNames: string[] = [];
  const regexParts: string[] = [];
  const escapedDelimiter = escapeRegex(delimiter);

  for (const [i, segment] of segments.entries()) {
    if (isParameterToken(segment)) {
      const paramName = segment.name;

      paramNames.push(paramName);

      const paramPattern = getParamPattern(segment);

      if (segment.optional) {
        const previousSegment = segments[i - 1];

        if (previousSegment && isLiteralToken(previousSegment) && previousSegment.value) {
          const previousLiteral = previousSegment.value;
          const separator = previousLiteral.at(-1) ?? delimiter;
          const precedingLiteral = previousLiteral.slice(0, -1);

          regexParts.pop();

          regexParts.push(
            `${escapeRegex(precedingLiteral)}(?:${escapeRegex(separator)}(?<${paramName}>${paramPattern}))?`,
          );

          continue;
        }

        regexParts.push(`(?<${paramName}>${paramPattern})?`);
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
    regexParts.push(`${escapedDelimiter}?`);
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

      if (is.nullish(value)) {
        params[paramName] = undefined;
        continue;
      }

      try {
        validateConstraints(paramName, value, paramSegment.constraints);
        params[paramName] = value;
      } catch (error) {
        if (options.strict) {
          throw error;
        }

        return {
          match: false,
          params: null,
        };
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
