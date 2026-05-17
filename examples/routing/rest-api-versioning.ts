import { match } from '@cookbook/pathkit';

const routes = [
  {
    pattern: '/api/{version:list(v1|v2)}/users/{id:int}',
    handler: ({ version, id }: Record<string, unknown>) => ({ status: 200, version, id }),
  },
];

const dispatch = (path: string) => {
  for (const route of routes) {
    const result = match(route.pattern)(path);

    if (result.match) {
      return route.handler(result.params ?? {});
    }
  }

  return { status: 404, body: 'Not found' };
};

console.log(dispatch('/api/v2/users/42'));
// { status: 200, version: 'v2', id: '42' }

console.log(dispatch('/api/v3/users/42'));
// { status: 404, body: 'Not found' }
