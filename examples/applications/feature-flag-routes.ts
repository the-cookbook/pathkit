import { match } from '@cookbook/pathkit';

const flags = {
  newBilling: false,
};

const routes = [
  {
    pattern: '/billing',
    enabled: () => flags.newBilling,
    handler: () => ({ status: 200, body: 'New billing' }),
  },
  {
    pattern: '/account',
    enabled: () => true,
    handler: () => ({ status: 200, body: 'Account' }),
  },
];

const dispatch = (path: string) => {
  for (const route of routes) {
    if (!route.enabled()) {
      continue;
    }

    if (match(route.pattern)(path).match) {
      return route.handler();
    }
  }

  return { status: 404, body: 'Not found' };
};

console.log(dispatch('/billing'));
// { status: 404, body: 'Not found' }
