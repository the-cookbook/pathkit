import tokenize from './tokenize';
import validateConstraints from './validate-constraints';
import escapeRegex from './utils/escape-regex';
import { getRegisteredConstraint } from './utils/get-constraint';
import { is } from './utils/is';
import { isLiteralToken, isParameterToken } from './utils/segment-filters';
import type { MatchedParam, ParameterSegment, RouteSegment } from './contracts';

type WildcardFormat = 'string' | 'array';

type DecodeParam = (value: string) => string;

interface MatchOptions {
  delimiter?: string;
  trailing?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  end?: boolean;
  wildcardFormat?: WildcardFormat;
  decode?: boolean | DecodeParam;
}

type ResolvedMatchOptions = Required<MatchOptions>;

interface CompiledParam {
  name: string;
  segment: ParameterSegment;
}

interface CompiledRoute {
  pattern: RegExp;
  params: CompiledParam[];
}

interface MatchSuccess {
  match: true;
  path: string;
  params: MatchedParam;
}

interface MatchFailure {
  match: false;
  params: null;
}

type MatchResult = MatchSuccess | MatchFailure;

const defaultOptions: ResolvedMatchOptions = {
  delimiter: '/',
  trailing: true,
  sensitive: false,
  strict: false,
  end: true,
  wildcardFormat: 'string',
  decode: false,
};

const resolveOptions = (options: MatchOptions): ResolvedMatchOptions => ({
  ...defaultOptions,
  ...options,
});

const decodeMatchedValue = (value: string, decode: ResolvedMatchOptions['decode']): string => {
  if (!decode) {
    return value;
  }

  if (decode === true) {
    return decodeURIComponent(value);
  }

  return decode(value);
};

const getDefaultParamPattern = (paramSegment: ParameterSegment, delimiter: string): string => {
  if (paramSegment.wildcard) {
    return '.*';
  }

  return `[^${escapeRegex(delimiter)}]+`;
};

const getParamPattern = (paramSegment: ParameterSegment, options: ResolvedMatchOptions): string => {
  if (!paramSegment.constraints.length) {
    return getDefaultParamPattern(paramSegment, options.delimiter);
  }

  for (const constraint of paramSegment.constraints) {
    const validator = getRegisteredConstraint(constraint.type);

    if (!validator) {
      if (options.strict) {
        throw new Error(
          `[Match] Constraint '${constraint.type}' declared for '${paramSegment.name}' parameter is not registered.`,
        );
      }

      continue;
    }

    if (options.strict) {
      continue;
    }

    const constraintRegExp = validator.toRegExp(constraint.params);

    if (constraintRegExp) {
      return constraintRegExp;
    }
  }

  return getDefaultParamPattern(paramSegment, options.delimiter);
};

const formatMatchedValue = (
  value: string,
  paramSegment: ParameterSegment,
  options: ResolvedMatchOptions,
): string | string[] => {
  if (!paramSegment.wildcard) {
    return decodeMatchedValue(value, options.decode);
  }

  if (options.wildcardFormat === 'string') {
    return decodeMatchedValue(value, options.decode);
  }

  if (!value) {
    return [];
  }

  return value
    .split(options.delimiter)
    .map((segment) => decodeMatchedValue(segment, options.decode));
};

const getConstraintValue = (value: string | string[], delimiter: string): string => {
  if (Array.isArray(value)) {
    return value.join(delimiter);
  }

  return value;
};

const getRegexEnding = (
  routeSource: string,
  escapedDelimiter: string,
  options: ResolvedMatchOptions,
): string => {
  if (options.end) {
    return options.trailing ? `${escapedDelimiter}?$` : '$';
  }

  if (routeSource.endsWith(escapedDelimiter)) {
    return '';
  }

  return `(?=${escapedDelimiter}|$)`;
};

const assertUniqueParamName = (name: string, seenParamNames: Set<string>): void => {
  if (seenParamNames.has(name)) {
    throw new Error(`[Match] Duplicate parameter name '${name}' is not allowed.`);
  }

  seenParamNames.add(name);
};

const buildOptionalParamPattern = (
  paramName: string,
  paramPattern: string,
  segmentIndex: number,
  segments: readonly RouteSegment[],
  regexParts: string[],
  delimiter: string,
): string => {
  const previousSegment = segments[segmentIndex - 1];

  if (!previousSegment || !isLiteralToken(previousSegment) || !previousSegment.value) {
    return `(?<${paramName}>${paramPattern})?`;
  }

  const previousLiteral = previousSegment.value;
  const separator = previousLiteral.at(-1) ?? delimiter;
  const precedingLiteral = previousLiteral.slice(0, -1);

  regexParts.pop();

  return `${escapeRegex(precedingLiteral)}(?:${escapeRegex(separator)}(?<${paramName}>${paramPattern}))?`;
};

const buildRegexFromRoute = (
  segments: readonly RouteSegment[],
  options: ResolvedMatchOptions,
): CompiledRoute => {
  const regexParts: string[] = [];
  const params: CompiledParam[] = [];
  const seenParamNames = new Set<string>();
  const escapedDelimiter = escapeRegex(options.delimiter);

  for (const [index, segment] of segments.entries()) {
    if (isParameterToken(segment)) {
      const paramName = segment.name;
      const paramPattern = getParamPattern(segment, options);

      assertUniqueParamName(paramName, seenParamNames);

      params.push({
        name: paramName,
        segment,
      });

      if (segment.optional) {
        regexParts.push(
          buildOptionalParamPattern(
            paramName,
            paramPattern,
            index,
            segments,
            regexParts,
            options.delimiter,
          ),
        );

        continue;
      }

      regexParts.push(`(?<${paramName}>${paramPattern})`);
      continue;
    }

    if (isLiteralToken(segment) && segment.value) {
      regexParts.push(escapeRegex(segment.value));
    }
  }

  const routeSource = regexParts.join('');
  const regexEnding = getRegexEnding(routeSource, escapedDelimiter, options);
  const flags = options.sensitive ? '' : 'i';

  return {
    pattern: new RegExp(`^${routeSource}${regexEnding}`, flags),
    params,
  };
};

const match = (route: string, options: MatchOptions = {}) => {
  const resolvedOptions = resolveOptions(options);
  const segments = tokenize(route);
  const compiledRoute = buildRegexFromRoute(segments, resolvedOptions);

  return (path: string): MatchResult => {
    const result = compiledRoute.pattern.exec(path);

    if (!result) {
      return {
        match: false,
        params: null,
      };
    }

    const params: MatchedParam = {};

    for (const compiledParam of compiledRoute.params) {
      const value = result.groups?.[compiledParam.name];

      if (is.nullish(value)) {
        params[compiledParam.name] = undefined;
        continue;
      }

      const matchedValue = formatMatchedValue(value, compiledParam.segment, resolvedOptions);
      const constraintValue = getConstraintValue(matchedValue, resolvedOptions.delimiter);

      try {
        validateConstraints(compiledParam.name, constraintValue, compiledParam.segment.constraints);
      } catch (error) {
        if (resolvedOptions.strict) {
          throw error;
        }

        return {
          match: false,
          params: null,
        };
      }

      params[compiledParam.name] = matchedValue;
    }

    return {
      match: true,
      path: result[0],
      params,
    };
  };
};

export type { DecodeParam, MatchOptions, MatchResult, WildcardFormat };
export default match;
