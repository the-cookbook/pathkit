import { match } from '@the-cookbook/pathkit';

const services = [
  {
    name: 'users',
    pattern: '/api/users/{*path?}',
    target: 'https://users.internal',
  },
  {
    name: 'billing',
    pattern: '/api/billing/{*path?}',
    target: 'https://billing.internal',
  },
];

const resolveUpstream = (path: string) => {
  for (const service of services) {
    const result = match(service.pattern)(path);

    if (result.match) {
      return {
        service: service.name,
        target: service.target,
        path: result.params?.path ?? '',
      };
    }
  }

  return {
    service: 'not-found',
    target: null,
    status: 404,
  };
};

console.log(resolveUpstream('/api/users/42/profile'));
// { service: 'users', target: 'https://users.internal', path: '42/profile' }

console.log(resolveUpstream('/api/unknown'));
// { service: 'not-found', target: null, status: 404 }
