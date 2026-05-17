import {
  getConstraint,
  hasConstraint,
  registerConstraint,
  resetConstraints,
  unregisterConstraint,
} from '@cookbook/pathkit';
import type { ConstraintValidation } from '@cookbook/pathkit';

const noop: ConstraintValidation = Object.assign(() => undefined, {
  verify: () => undefined,
  toRegExp: () => '[^/]+',
});

console.log(hasConstraint('custom'));
// false

registerConstraint('custom', noop);

console.log(hasConstraint('custom'));
// true

console.log(getConstraint('custom') === noop);
// true

unregisterConstraint('custom');

console.log(hasConstraint('custom'));
// false

resetConstraints();
