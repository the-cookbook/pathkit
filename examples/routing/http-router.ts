import { match } from '@the-cookbook/pathkit';

type RequestLike = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
};

type ResponseLike = {
  status: number;
  body: unknown;
};

const routes = [
  {
    method: 'GET',
    pattern: '/users/{id:int}',
    handler: ({ id }: Record<string, unknown>): ResponseLike => ({ status: 200, body: { id } }),
  },
  {
    method: 'GET',
    pattern: '/health',
    handler: (): ResponseLike => ({ status: 200, body: { ok: true } }),
  },
] as const;

const notFound = (): ResponseLike => ({
  status: 404,
  body: { error: 'Not Found' },
});

const dispatch = (request: RequestLike): ResponseLike => {
  for (const route of routes) {
    if (route.method !== request.method) {
      continue;
    }

    const result = match(route.pattern)(request.path);

    if (result.match) {
      return route.handler(result.params ?? {});
    }
  }

  return notFound();
};

console.log(dispatch({ method: 'GET', path: '/users/42' }));
// { status: 200, body: { id: '42' } }

console.log(dispatch({ method: 'GET', path: '/missing' }));
// { status: 404, body: { error: 'Not Found' } }
