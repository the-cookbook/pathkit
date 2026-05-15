import { getRegisteredConstraint } from './utils/get-constraint';
import type { Constraint } from './contracts';

const validateConstraints = (
  paramName: string,
  value: string | number | boolean | undefined,
  constraints: readonly Constraint[],
): void => {
  for (const constraint of constraints) {
    const validator = getRegisteredConstraint(constraint.type);

    if (!validator) {
      throw new Error(`[Constraint]: Unknown constraint type: ${constraint.type}`);
    }

    validator(paramName, value, constraint.params);
  }
};

export default validateConstraints;
