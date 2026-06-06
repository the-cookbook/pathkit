import { is } from '../utils/is';
import { typeOf } from '../utils/type-of';
import type { ConstraintValidation } from '../contracts';

const decimal: ConstraintValidation = (paramName, value, params) => {
  decimal.verify(paramName, params);

  if (is.nullish(value) || !new RegExp(`^${decimal.toRegExp(params)}$`).test(String(value))) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must be a decimal number, instead got '${typeOf(value)}'`,
    );
  }
};

decimal.verify = (paramName, params) => {
  if (params.trim().length) {
    throw new Error(
      `[Constraint] Constraint 'decimal' declared for '${paramName}' parameter does not require parameter(s), ` +
        `but got '(${params})'`,
    );
  }
};

decimal.toRegExp = () => {
  return '\\d+(?:\\.\\d+)?';
};

export default decimal;
