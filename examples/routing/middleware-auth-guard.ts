import { match } from '@cookbook/pathkit';

const protectedRoutes = [
  match('/account/{*path?}'),
  match('/admin/{*path?}'),
  match('/billing/{*path?}'),
];

const isProtectedRoute = (path: string): boolean =>
  protectedRoutes.some((matcher) => matcher(path).match);

const handleRequest = (path: string, isAuthenticated: boolean) => {
  if (isProtectedRoute(path) && !isAuthenticated) {
    return { status: 401, body: 'Unauthorized' };
  }

  const knownRoutes = [match('/'), match('/login'), ...protectedRoutes];

  if (!knownRoutes.some((matcher) => matcher(path).match)) {
    return { status: 404, body: 'Not found' };
  }

  return { status: 200, body: 'OK' };
};

console.log(handleRequest('/account/settings', false));
// { status: 401, body: 'Unauthorized' }

console.log(handleRequest('/does-not-exist', true));
// { status: 404, body: 'Not found' }
