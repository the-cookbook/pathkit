import { match } from '@cookbook/pathkit';

const matchUser = match('/users/{userId:int}');

console.log(matchUser('/users/42'));
// { match: true, params: { userId: '42' } }

console.log(matchUser('/users/me'));
// { match: false, params: null }
