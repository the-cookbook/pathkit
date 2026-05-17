import { compile } from '@cookbook/pathkit';

const userProfilePath = compile('/users/{userId:int}/profile');
const settingsPath = compile('/users/{userId:int}/settings/{section?}');

console.log(userProfilePath({ userId: 42 }));
// /users/42/profile

console.log(settingsPath({ userId: 42 }));
// /users/42/settings

console.log(settingsPath({ userId: 42, section: 'security' }));
// /users/42/settings/security
