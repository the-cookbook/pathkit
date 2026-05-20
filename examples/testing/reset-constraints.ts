import { createConstraint, registerConstraint, resetConstraints } from '@cookbook/pathkit';

const mockConstraint = createConstraint({
  parse: () => undefined,
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
