import type { Constraint } from './contracts';
import * as constraintMethods from './constraints';

type ConstraintType = keyof typeof constraintMethods;

const isConstraintType = (type: string): type is ConstraintType => type in constraintMethods;

const validateConstraints = (
  paramName: string,
  value: string | number | boolean | undefined,
  constraints: readonly Constraint[],
): void => {
  for (const constraint of constraints) {
    if (!isConstraintType(constraint.type)) {
      throw new Error(`[Constraint]: Unknown constraint type: ${constraint.type}`);
    }

    const validator = constraintMethods[constraint.type];

    validator(paramName, value, constraint.params);
  }
};

export default validateConstraints;
