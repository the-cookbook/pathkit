import { is } from '../utils/is';
import type { ConstraintValidation } from '../contracts';

const uuid: ConstraintValidation = (paramName, value, params) => {
  uuid.verify(paramName, params);

  const source = uuid.toRegExp(params);
  const regExp = new RegExp(`^(?:${source})$`);

  if (is.nullish(value) || !regExp.test(String(value))) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" is not a valid UUID: '${String(value)}'`,
    );
  }
};

uuid.verify = (paramName, params) => {
  if (params) {
    throw new Error(
      `[Constraint] Constraint 'uuid' declared for '${paramName}' parameter does not require parameter(s), ` +
        `but got '(${params})'`,
    );
  }
};

uuid.toRegExp = () => {
  return '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
};

export default uuid;
