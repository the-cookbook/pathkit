import tokenize from './tokenize';
import type { ConstraintValidation } from './contracts';
import { getRegisteredConstraint } from './utils/get-constraint';
import { isParameterToken } from './utils/segment-filters';

const validateRoute = (route: string): void => {
  const segments = tokenize(route);
  const paramSegments = segments
    .filter(isParameterToken)
    .filter(({ constraints }) => Boolean(constraints.length));

  for (const { name, constraints } of paramSegments) {
    for (const constraint of constraints) {
      const validator: ConstraintValidation | undefined = getRegisteredConstraint(constraint.type);

      if (!validator) {
        throw new Error(
          `[Constraint]: Unknown constraint type: "${constraint.type}" for route pattern "${route}"`,
        );
      }

      try {
        validator.verify(name, constraint.params);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`${e.message}.\n Route: ${route}`);
        }

        throw e;
      }
    }
  }
};

export default validateRoute;
