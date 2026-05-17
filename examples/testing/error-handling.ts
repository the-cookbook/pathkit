import { compile, match, validateRoute } from '@cookbook/pathkit';

try {
  validateRoute('/users/{id:unknown}');
} catch (error) {
  console.error('Invalid route pattern:', error);
}

try {
  const userPath = compile('/users/{id:int}');

  userPath({ id: 'abc' });
} catch (error) {
  console.error('Invalid compile params:', error);
}

const result = match('/users/{id:int}')('/users/abc');

if (!result.match) {
  console.log({ status: 404, body: 'Not found' });
}
