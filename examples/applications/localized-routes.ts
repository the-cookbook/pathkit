import { compile, match } from '@cookbook/pathkit';

const localizedProductPath = compile('/{locale:list(en|pt|de)}/products/{slug:regex([a-z0-9-]+)}');

console.log(localizedProductPath({ locale: 'pt', slug: 'mesa-de-madeira' }));
// /pt/products/mesa-de-madeira

const matchLocalizedProduct = match('/{locale:list(en|pt|de)}/products/{slug:regex([a-z0-9-]+)}');

console.log(matchLocalizedProduct('/de/products/holz-tisch'));
// { match: true, params: { locale: 'de', slug: 'holz-tisch' } }

console.log(matchLocalizedProduct('/fr/products/table'));
// { match: false, params: null }
