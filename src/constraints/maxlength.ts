import { is } from '../utils/is';
import type { ConstraintValidation } from '../contracts';

const maxlength: ConstraintValidation = (paramName, value, params) => {
  maxlength.verify(paramName, params);

  const maxLength = +params;

  if (is.nullish(value) || value.toString().length > maxLength) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must have max legth of ${maxLength.toString()} chars, instead got '${String(value).length.toString()}'`,
    );
  }
};

maxlength.verify = (paramName, params) => {
  if (!params) {
    throw new Error(`[Constraint] Parameter "${paramName}" requires a max length value`);
  }

  if (!/^-?\d+$/.test(params)) {
    throw new Error(`[Constraint] Parameter "${paramName}" requires an integer value`);
  }

  if (+params <= 0) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" requires a value greather or equal to 1`,
    );
  }
};

maxlength.toRegExp = () => {
  return '.*';
};

export default maxlength;
