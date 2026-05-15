import type { ConstraintValidation } from '../contracts';

import int from './int';
import list from './list';
import range from './range';
import regex from './regex';

interface ConstraintRegistry {
  int: ConstraintValidation;
  list: ConstraintValidation;
  range: ConstraintValidation;
  regex: ConstraintValidation;
  [name: string]: ConstraintValidation;
}

const builtInConstraints: ConstraintRegistry = {
  int,
  list,
  range,
  regex,
};

const constraints = new Map<string, ConstraintValidation>(Object.entries(builtInConstraints));

export const registerConstraint = (name: string, constraint: ConstraintValidation): void => {
  constraints.set(name, constraint);
};

export const unregisterConstraint = (name: string): void => {
  constraints.delete(name);
};

export const resetConstraints = (): void => {
  constraints.clear();

  for (const [name, constraint] of Object.entries(builtInConstraints)) {
    constraints.set(name, constraint);
  }
};

export const getConstraint = (name: string): ConstraintValidation | undefined =>
  constraints.get(name);

export const getRegisteredConstraint = getConstraint;

export const hasConstraint = (name: string): boolean => constraints.has(name);

export const hasRegisteredConstraint = hasConstraint;
