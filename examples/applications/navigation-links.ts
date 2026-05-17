import { compile } from '@the-cookbook/pathkit';

const routes = {
  dashboard: compile('/dashboard'),
  project: compile('/projects/{projectId:int}'),
  issue: compile('/projects/{projectId:int}/issues/{issueId:int}'),
};

const navigation = {
  dashboard: routes.dashboard(),
  currentProject: routes.project({ projectId: 12 }),
  currentIssue: routes.issue({ projectId: 12, issueId: 99 }),
};

console.log(navigation);
// {
//   dashboard: '/dashboard',
//   currentProject: '/projects/12',
//   currentIssue: '/projects/12/issues/99'
// }
