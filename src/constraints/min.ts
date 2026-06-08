import { is } from '../utils/is';
import { typeOf } from '../utils/type-of';
import type { ConstraintValidation } from '../contracts';

const min: ConstraintValidation = (paramName, value, params) => {
  min.verify(paramName, params);

  if (is.nullish(value) || Number.isNaN(+value)) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must be a number, instead got '${typeOf(value)}'`,
    );
  }

  const minValue = +params;

  if (+value < minValue) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" value must be at least ${minValue.toString()}, instead got '${String(value)}'`,
    );
  }
};

min.verify = (paramName, params) => {
  if (!params) {
    throw new Error(
      `[Constraint] Constraint 'min' declared for '${paramName}' requires a min value`,
    );
  }

  if (!/^-?\d+$/.test(params)) {
    throw new Error(
      `[Constraint] Constraint 'min' declared for '${paramName}' requires an integer value`,
    );
  }
};

min.toRegExp = () => {
  return '-?\\d+(?:\\.\\d+)?';
};

export default min;
