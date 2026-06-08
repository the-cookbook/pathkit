import { is } from '../utils/is';
import { typeOf } from '../utils/type-of';
import type { ConstraintValidation } from '../contracts';

const max: ConstraintValidation = (paramName, value, params) => {
  max.verify(paramName, params);

  if (is.nullish(value) || Number.isNaN(+value)) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must be a number, instead got '${typeOf(value)}'`,
    );
  }

  const maxValue = +params;

  if (+value > maxValue) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" value must be no more than ${maxValue.toString()}, instead got '${String(value)}'`,
    );
  }
};

max.verify = (paramName, params) => {
  if (!params) {
    throw new Error(`[Constraint] Parameter "${paramName}" requires a max value`);
  }

  if (!/^-?\d+$/.test(params)) {
    throw new Error(`[Constraint] Parameter "${paramName}" requires an integer value`);
  }
};

max.toRegExp = () => {
  return '-?\\d+(?:\\.\\d+)?';
};

export default max;
