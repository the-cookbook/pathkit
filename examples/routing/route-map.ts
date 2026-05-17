import { compile, match } from '@the-cookbook/pathkit';

const routes = {
  home: '/',
  user: '/users/{id:int}',
  project: '/orgs/{orgId:int}/projects/{projectId:int}',
  notFound: '/404',
} as const;

const to = {
  home: compile(routes.home),
  user: compile(routes.user),
  project: compile(routes.project),
  notFound: compile(routes.notFound),
};

console.log(to.user({ id: 42 }));
// /users/42

const resolve = (path: string) => {
  const candidates = [
    { name: 'home', matcher: match(routes.home) },
    { name: 'user', matcher: match(routes.user) },
    { name: 'project', matcher: match(routes.project) },
  ];

  for (const candidate of candidates) {
    const result = candidate.matcher(path);

    if (result.match) {
      return { name: candidate.name, params: result.params };
    }
  }

  return { name: 'notFound', params: null };
};

console.log(resolve('/unknown'));
// { name: 'notFound', params: null }
