import { compile, match } from '@cookbook/pathkit';

const assetPath = compile('/assets/{*path}');

console.log(assetPath({ path: ['images', 'avatars', 'user-42.png'] }));
// /assets/images/avatars/user-42.png

const matchAsset = match('/assets/{*path}');

console.log(matchAsset('/assets/images/avatars/user-42.png'));
// { match: true, params: { path: 'images/avatars/user-42.png' } }
