import { match, registerConstraint, resetConstraints } from '@cookbook/pathkit';
import type { ConstraintValidation } from '@cookbook/pathkit';

const allowedTenants = new Set(['acme', 'globex', 'initech']);

const tenant: ConstraintValidation = Object.assign(
  (paramName: string, value: string | number | boolean | undefined) => {
    if (typeof value !== 'string' || !allowedTenants.has(value)) {
      throw new Error(`Parameter "${paramName}" is not a valid tenant`);
    }
  },
  {
    verify: () => undefined,
    toRegExp: () => '[a-z0-9-]+',
  },
);

registerConstraint('tenant', tenant);

const routes = [
  {
    pattern: '/{tenant:tenant}/dashboard',
    handler: (params: Record<string, unknown>) => ({
      status: 200,
      body: `Dashboard for ${params.tenant}`,
    }),
  },
  {
    pattern: '/{tenant:tenant}/settings',
    handler: (params: Record<string, unknown>) => ({
      status: 200,
      body: `Settings for ${params.tenant}`,
    }),
  },
];

const notFound = () => ({ status: 404, body: 'Not found' });

const dispatch = (path: string) => {
  for (const route of routes) {
    const result = match(route.pattern)(path);

    if (result.match && result.params) {
      return route.handler(result.params);
    }
  }

  return notFound();
};

console.log(dispatch('/acme/dashboard'));
// { status: 200, body: 'Dashboard for acme' }

console.log(dispatch('/unknown/dashboard'));
// { status: 404, body: 'Not found' }

resetConstraints();
