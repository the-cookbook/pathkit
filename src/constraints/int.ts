import { is } from '../utils/is';
import { typeOf } from '../utils/type-of';
import type { ConstraintValidation } from '../contracts';

const int: ConstraintValidation = (paramName, value, params) => {
  int.verify(paramName, params);

  if (is.nullish(value) || Number.isNaN(+value)) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must be a number, instead got '${typeOf(value)}'`,
    );
  }
};

int.verify = (paramName, params) => {
  if (params.trim().length) {
    throw new Error(
      `[Constraint] Constraint 'int' declared for '${paramName}' parameter does not require parameter(s), ` +
        `but got '(${params})'`,
    );
  }
};

int.toRegExp = () => {
  return '\\d+';
};

export default int;
