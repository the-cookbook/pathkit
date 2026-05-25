import { is } from '../utils/is';
import happen from '../utils/happen';

import type { ConstraintValidation } from '../contracts';

const range: ConstraintValidation = (paramName, value, params) => {
  range.verify(paramName, params);

  const receivedValue = String(value);

  if (is.nullish(value) || Number.isNaN(Number(value))) {
    throw new Error(
      `[Constraint] Parameter '${paramName}' expects numeric value, instead got '${receivedValue}'.`,
    );
  }

  const [min, max] = params.split(',').map(Number);
  const parsedValue = Number(value);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (!happen(parsedValue).between(min!, max!)) {
    throw new Error(
      `[Constraint] Parameter "${paramName}" must be a number between ${String(min)} and ${String(
        max,
      )}, instead received "${receivedValue}"`,
    );
  }
};

range.verify = (paramName, params) => {
  const interval = params.split(',');

  if (interval.length !== 2) {
    throw new Error(
      `[Constraint] Constraint 'range' declared for '${paramName}' parameter` +
        ` expects expected 2 parameters, received ${!params.length ? '0' : String(interval.length)}`,
    );
  }

  const invalidParams = interval.filter((n) => Number.isNaN(Number(n)));

  if (!invalidParams.length) {
    return;
  }

  throw new Error(
    `[Constraint] Constraint 'range' declared for '${paramName}' expects numeric parameters.` +
      ` Received: ${invalidParams.map((n) => `'${n}'`).join(', ')}.`,
  );
};

range.toRegExp = () => {
  return '\\d+';
};

export default range;
