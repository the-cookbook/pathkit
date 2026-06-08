import { is } from '../utils/is';

import type { ConstraintValidation } from '../contracts';

const regex: ConstraintValidation = (paramName, value, params) => {
  regex.verify(paramName, params);

  const source = regex.toRegExp(params);
  const regExp = new RegExp(`^(?:${source})$`);

  if (is.nullish(value) || !params.trim() || !regExp.test(String(value))) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" failed to match the regular expression ${params}'`,
    );
  }
};

regex.verify = (paramName, params) => {
  if (!params) {
    throw new Error(
      `[Constraint] Constraint 'regex' declared for '${paramName}' expects a regular expression parameter.`,
    );
  }
};

regex.toRegExp = (params) => {
  let sanitized = params;

  if (params.startsWith('^')) {
    sanitized = sanitized.substring(1);
  }

  if (params.endsWith('$') && !params.endsWith('\\$')) {
    sanitized = sanitized.slice(0, -1);
  }

  return sanitized;
};

export default regex;
