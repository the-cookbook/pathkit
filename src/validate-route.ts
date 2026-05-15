import tokenize from './tokenize';
import * as constraintMethods from './constraints';
import { isParameterToken } from './utils/segment-filters';

type ConstraintType = keyof typeof constraintMethods;

const isConstraintType = (type: string): type is ConstraintType => type in constraintMethods;

const validateRoute = (route: string): void => {
  const segments = tokenize(route);
  const paramSegments = segments
    .filter(isParameterToken)
    .filter(({ constraints }) => Boolean(constraints.length));

  for (const { name, constraints } of paramSegments) {
    for (const constraint of constraints) {
      if (!isConstraintType(constraint.type)) {
        throw new Error(
          `[Constraint]: Unknown constraint type: "${constraint.type}" for route pattern "${route}"`,
        );
      }

      const validator = constraintMethods[constraint.type];

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
