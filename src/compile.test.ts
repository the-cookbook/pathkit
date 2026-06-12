import compile, { type CompileOptions } from './compile';
import type { TypeOrArray } from './contracts';

describe('compile()', () => {
  afterEach(() => {
    vi.doUnmock('./tokenize');
    vi.resetModules();
  });

  it('should throw error on wrong route pattern', () => {
    expect(() => compile('/{:hello}')).toThrow();
  });

  it('should throw error on missing required parameter', () => {
    expect(() => compile('/{hello}')({})).toThrow('Missing required parameter: hello');
  });

  it('should throw error when required parameter is undefined', () => {
    expect(() => compile('/{hello}')({ hello: undefined })).toThrow(
      'Missing required parameter: hello',
    );
  });

  it('should throw error when required parameter is null', () => {
    expect(() => compile('/{hello}')({ hello: null })).toThrow('Missing required parameter: hello');
  });

  it('should throw error wrong data type non wildcard parameter', () => {
    // @ts-expect-error: wrong type usage for test assertion purpose
    expect(() => compile('/{name}')({ name: Symbol('foo') })).toThrow(
      "Parameter 'name' value must be a string, number or boolean, instead received: 'Symbol(foo)' (symbol).",
    );
  });

  it('should throw error wrong constraint satisfaction', () => {
    expect(() => compile('/{page:list(home|dashboard)}')({ page: 'settings' })).toThrow(
      'Parameter "page" must be one of: home, dashboard',
    );
  });

  it.each([
    {
      pattern: '/hello/{name}',
      params: { name: 'world' },
      expects: '/hello/world',
    },
    {
      pattern: '/hello/{file}',
      params: { file: 'foo.txt' },
      expects: '/hello/foo.txt',
    },
    {
      pattern: '/hello/{file}.{ext}',
      params: { file: 'foo', ext: 'txt' },
      expects: '/hello/foo.txt',
    },
    {
      pattern: '/page/history/{page:range(1,100)?}',
      params: { page: 50 },
      expects: '/page/history/50',
    },
    {
      pattern: '/page/settings/{number:range(1,100)?}',
      params: {},
      expects: '/page/settings',
    },
    {
      pattern: '/search/{*wildcard}',
      params: { wildcard: ['anything', 'goes', 'here'] },
      expects: '/search/anything/goes/here',
    },
    {
      pattern: '/never/{secret}',
      params: { secret: ['gonna', 'give', 'you', 'up'] },
      expects: '/never/gonna/give/you/up',
    },
    {
      pattern: '/files/{*path}',
      params: { path: 'folder/subfolder/file.txt' },
      expects: '/files/folder/subfolder/file.txt',
    },
    {
      pattern: '/tags/{*path}',
      params: { path: ['frontend', 'typescript', 'routing'] },
      options: { delimiter: '.' },
      expects: '/tags/frontend.typescript.routing',
    },
    {
      pattern: '.tags.{*path}',
      params: { path: ['frontend', 'typescript', 'routing'] },
      options: { delimiter: '.' },
      expects: '.tags.frontend.typescript.routing',
    },
    {
      pattern: '.page.settings.{number:range(1,100)?}',
      params: {},
      options: { delimiter: '.' },
      expects: '.page.settings',
    },
    {
      pattern: '/feature/{enabled}',
      params: { enabled: true },
      expects: '/feature/true',
    },
    {
      pattern: '/feature/{enabled}',
      params: { enabled: false },
      expects: '/feature/false',
    },
    {
      pattern: '/products/{id}',
      params: { id: 123 },
      expects: '/products/123',
    },
  ] satisfies {
    pattern: string;
    params: Record<string, TypeOrArray<string | number | boolean> | undefined | null>;
    options?: CompileOptions;
    expects: string;
  }[])(
    'should compile route pattern $pattern accordingly',
    ({ pattern, params, options, expects }) => {
      expect(compile(pattern, options)(params)).toEqual(expects);
    },
  );

  it.each([
    {
      pattern: 'c://hello/{name}',
      params: { name: 'world' },
      expects: 'c://hello/world',
    },
  ])('should compile file path pattern $pattern accordingly', ({ pattern, params, expects }) => {
    expect(compile(pattern, { prune: 'trailing' })(params)).toEqual(expects);
  });

  it('should skip optional parameter when value is undefined', () => {
    expect(compile('/articles/{slug?}')({ slug: undefined })).toEqual('/articles');
  });

  it('should skip optional parameter when value is null', () => {
    expect(compile('/articles/{slug?}')({ slug: null })).toEqual('/articles');
  });

  it('should join wildcard array values with default delimiter', () => {
    expect(
      compile('/docs/{*path}')({
        path: ['guides', 'routing', 'compile'],
      }),
    ).toEqual('/docs/guides/routing/compile');
  });

  it('should join wildcard array values with custom delimiter', () => {
    expect(
      compile('docs.{*path}', { delimiter: '.' })({
        path: ['guides', 'routing', 'compile'],
      }),
    ).toEqual('docs.guides.routing.compile');
  });

  it('should validate constraints after resolving parameter value', () => {
    expect(
      compile('/articles/{slug:regex([a-z0-9-]+)}')({
        slug: 'hello-world',
      }),
    ).toEqual('/articles/hello-world');
  });

  it('should skip empty literal segment value', async () => {
    vi.doMock('./tokenize', () => ({
      default: vi.fn(() => [
        {
          type: 'literal',
          value: '',
        },
        {
          type: 'literal',
          value: '/articles',
        },
      ]),
    }));

    const { default: mockedCompile } = await import('./compile');

    expect(mockedCompile('/ignored')()).toEqual('/articles');
  });

  describe('options.prune', () => {
    it('should prune all duplicated and trailing delimiters', () => {
      expect(compile('/{lang?}/foo/{section?}/', { prune: 'all' })()).toEqual('/foo');
    });

    it('should prune only duplicated delimiters', () => {
      expect(compile('/{lang?}/foo/{section?}/', { prune: 'duplication' })()).toEqual('/foo/');
    });

    it('should prune only trailing delimiters', () => {
      expect(compile('c://hello/world/', { prune: 'trailing' })()).toEqual('c://hello/world');
    });

    it('should not prune extraneous delimiter', () => {
      expect(compile('/{lang?}/foo/{section?}/', { prune: false })()).toEqual('//foo//');
    });

    it('should prune duplicated custom delimiters', () => {
      expect(
        compile('.{lang?}.foo.{section?}.', { delimiter: '.', prune: 'duplication' })(),
      ).toEqual('.foo.');
    });

    it('should prune trailing custom delimiter', () => {
      expect(compile('.hello.world.', { delimiter: '.', prune: 'trailing' })()).toEqual(
        '.hello.world',
      );
    });

    it('should prune all duplicated and trailing custom delimiters', () => {
      expect(compile('.{lang?}.foo.{section?}.', { delimiter: '.', prune: 'all' })()).toEqual(
        '.foo',
      );
    });
  });
});
