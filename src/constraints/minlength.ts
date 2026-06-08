import { is } from '../utils/is';
import type { ConstraintValidation } from '../contracts';

const minlength: ConstraintValidation = (paramName, value, params) => {
  minlength.verify(paramName, params);

  const minLength = +params;

  if (is.nullish(value) || value.toString().length < minLength) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must have min legth of ${minLength.toString()} chars, instead got '${String(value).length.toString()}'`,
    );
  }
};

minlength.verify = (paramName, params) => {
  if (!params) {
    throw new Error(
      `[Constraint] Constraint 'minlength' declared for '${paramName}' parameter requires a min length value`,
    );
  }

  if (!/^-?\d+$/.test(params)) {
    throw new Error(
      `[Constraint] Constraint 'minlength' declared for '${paramName}' parameter requires an integer value`,
    );
  }

  if (+params <= 0) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" requires a value greather or equal to 1`,
    );
  }
};

minlength.toRegExp = () => {
  return '.*';
};

export default minlength;
