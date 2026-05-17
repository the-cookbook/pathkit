import { registerConstraint, resetConstraints } from '@the-cookbook/pathkit';
import type { ConstraintValidation } from '@the-cookbook/pathkit';

const mockConstraint: ConstraintValidation = Object.assign(() => undefined, {
  verify: () => undefined,
  toRegExp: () => '[^/]+',
});

// beforeEach(() => {
//   registerConstraint('mock', mockConstraint);
// });
//
// afterEach(() => {
//   resetConstraints();
// });

registerConstraint('mock', mockConstraint);
resetConstraints();
