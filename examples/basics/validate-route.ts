import { validateRoute } from '@cookbook/pathkit';

const routes = [
  '/users/{id:int}',
  '/posts/{slug:regex([a-z0-9-]+)}',
  '/search/{type:list(view|expanded|details)}',
];

for (const route of routes) {
  validateRoute(route);
}
