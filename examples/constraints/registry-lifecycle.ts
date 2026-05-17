import {
  getConstraint,
  hasConstraint,
  registerConstraint,
  resetConstraints,
  unregisterConstraint,
} from '@the-cookbook/pathkit';
import type { ConstraintValidation } from '@the-cookbook/pathkit';

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
