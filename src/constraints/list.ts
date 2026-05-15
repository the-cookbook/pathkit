import escapeRegex from '../utils/escape-regex';
import { is } from '../utils/is';
import type { ConstraintValidation } from '../contracts';

const list: ConstraintValidation = (paramName, value, params) => {
  list.verify(paramName, params);

  const options = params.split('|');

  if (is.nullish(value) || !options.includes(String(value))) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must be one of: ${options.join(', ')}, instead got '${String(value)}'`,
    );
  }
};

list.verify = (paramName, params) => {
  if (!params) {
    throw new Error(`[Constraint] Parameter "${paramName}" requires a list of allowed values`);
  }
};

list.toRegExp = (params) => {
  const options = params.split('|').map(escapeRegex);

  return `(?:${options.join('|')})`;
};

export default list;
