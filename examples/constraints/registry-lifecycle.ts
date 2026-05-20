import {
  getConstraint,
  hasConstraint,
  createConstraint,
  registerConstraint,
  resetConstraints,
  unregisterConstraint,
} from '@cookbook/pathkit';

const noop = createConstraint({
  parse: (paramName, value, params) => {},
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
