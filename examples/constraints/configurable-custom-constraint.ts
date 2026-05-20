import { match, createConstraint, registerConstraint, resetConstraints } from '@cookbook/pathkit';

const country = createConstraint({
  parse: (paramName, value, params) => {
    const allowed = params.split('|');

    if (typeof value !== 'string' || !allowed.includes(value)) {
      throw new Error(`Parameter "${paramName}" must be one of: ${allowed.join(', ')}`);
    }
  },
  verify: (paramName, params) => {
    if (!params) {
      throw new Error(`Constraint "country" for "${paramName}" requires at least one country`);
    }
  },
  toRegExp: (params) => `(?:${params})`,
});

registerConstraint('country', country);

const matchLocalizedStore = match('/{country:country(us|br|de)}/store');

console.log(matchLocalizedStore('/br/store'));
// { match: true, params: { country: 'br' } }

console.log(matchLocalizedStore('/fr/store'));
// { match: false, params: null }

resetConstraints();
