import { tokenize } from '@the-cookbook/pathkit';

const segments = tokenize('/orgs/{orgId:int}/projects/{projectId:regex([a-z0-9-]+)}');

console.log(segments);
