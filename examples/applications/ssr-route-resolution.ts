import { match } from '@the-cookbook/pathkit';

const pages = [
  {
    pattern: '/',
    load: async () => ({ status: 200, component: 'HomePage', props: {} }),
  },
  {
    pattern: '/products/{id:int}',
    load: async (params: Record<string, unknown>) => ({
      status: 200,
      component: 'ProductPage',
      props: { id: params.id },
    }),
  },
];

const notFound = async () => ({
  status: 404,
  component: 'NotFoundPage',
  props: {},
});

const resolvePage = async (path: string) => {
  for (const page of pages) {
    const result = match(page.pattern)(path);

    if (result.match) {
      return page.load(result.params ?? {});
    }
  }

  return notFound();
};

console.log(await resolvePage('/products/42'));
console.log(await resolvePage('/missing'));
