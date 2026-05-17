import { match, registerConstraint, resetConstraints } from '@cookbook/pathkit';
import type { ConstraintValidation } from '@cookbook/pathkit';

const country: ConstraintValidation = Object.assign(
  (paramName: string, value: string | number | boolean | undefined, params: string) => {
    const allowed = params.split('|');

    if (typeof value !== 'string' || !allowed.includes(value)) {
      throw new Error(`Parameter "${paramName}" must be one of: ${allowed.join(', ')}`);
    }
  },
  {
    verify: (paramName: string, params: string) => {
      if (!params) {
        throw new Error(`Constraint "country" for "${paramName}" requires at least one country`);
      }
    },
    toRegExp: (params: string) => `(?:${params})`,
  },
);

registerConstraint('country', country);

const matchLocalizedStore = match('/{country:country(us|br|de)}/store');

console.log(matchLocalizedStore('/br/store'));
// { match: true, params: { country: 'br' } }

console.log(matchLocalizedStore('/fr/store'));
// { match: false, params: null }

resetConstraints();
