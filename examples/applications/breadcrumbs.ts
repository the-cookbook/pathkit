import { compile, match } from '@cookbook/pathkit';

const projectPath = compile('/projects/{projectId:int}');
const issuePath = compile('/projects/{projectId:int}/issues/{issueId:int}');
const matchIssue = match('/projects/{projectId:int}/issues/{issueId:int}');

const buildBreadcrumbs = (path: string) => {
  const result = matchIssue(path);

  if (!result.match || !result.params) {
    return [{ label: 'Not found', href: '/404' }];
  }

  return [
    { label: 'Projects', href: '/projects' },
    {
      label: `Project ${result.params.projectId}`,
      href: projectPath({ projectId: result.params.projectId }),
    },
    { label: `Issue ${result.params.issueId}`, href: issuePath(result.params) },
  ];
};

console.log(buildBreadcrumbs('/projects/12/issues/99'));
console.log(buildBreadcrumbs('/unknown'));
// [{ label: 'Not found', href: '/404' }]
