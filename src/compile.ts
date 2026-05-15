import tokenize from './tokenize';
import validateConstraints from './validate-constraints';
import { isLiteralToken, isParameterToken } from './utils/segment-filters';
import { is } from './utils/is';
import { typeOf } from './utils/type-of';
import type { TypeOrArray } from './contracts';

interface CompileOptions {
  delimiter?: string;
  prune?: 'all' | 'trailing' | 'duplication' | false;
}

type CompileMethod = (
  route: string,
  options?: CompileOptions,
) => (params?: Record<string, TypeOrArray<string | number | boolean> | undefined | null>) => string;

const defaultOptions: Required<CompileOptions> = {
  delimiter: '/',
  prune: 'all',
};

const buildPruneRegex = (options: Required<CompileOptions>): RegExp => {
  const { delimiter, prune } = options;

  const behaviour: Exclude<CompileOptions['prune'], 'all'>[] =
    prune === 'all' ? ['trailing', 'duplication'] : [prune];
  const pattern: string[] = [];

  if (behaviour.includes('duplication')) {
    pattern.push(`${delimiter}(?=${delimiter})`);
  }

  if (behaviour.includes('trailing')) {
    pattern.push(`(?<!^)${delimiter}$`);
  }

  return new RegExp(pattern.join('|'), 'g');
};

const compile: CompileMethod = (route, options = {}) => {
  const { delimiter, prune } = { ...defaultOptions, ...options };
  const segments = tokenize(route);

  return (params = {}) => {
    let compiledRoute = '';

    for (const segment of segments) {
      if (isParameterToken(segment)) {
        const paramName = segment.name;
        const rawParamValue = params[paramName];

        const paramValue = is.array(rawParamValue) ? rawParamValue.join(delimiter) : rawParamValue;

        if (is.nullish(paramValue)) {
          if (segment.optional) {
            continue;
          }

          throw new Error(`[Compile] Missing required parameter: ${paramName}`);
        }

        if (!is.string(paramValue) && !is.number(paramValue) && !is.bool(paramValue)) {
          throw new Error(
            `[Compile] Parameter '${paramName}' value must be a string, number or boolean,` +
              ` instead received: '${String(paramValue)}' (${typeOf(paramValue)}).`,
          );
        }

        if (segment.constraints.length) {
          validateConstraints(paramName, paramValue, segment.constraints);
        }

        compiledRoute += String(paramValue);

        continue;
      }

      if (isLiteralToken(segment)) {
        const { value } = segment;

        if (!value) {
          continue;
        }

        compiledRoute += value;
      }
    }

    if (prune) {
      compiledRoute = compiledRoute.replace(buildPruneRegex({ delimiter, prune }), '');
    }

    return compiledRoute;
  };
};

export type { CompileOptions };
export default compile;
