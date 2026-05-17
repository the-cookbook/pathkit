import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = [/^node:/];

const entries = {
  index: 'src/index.ts',
  compile: 'src/compile.ts',
  match: 'src/match.ts',
  tokenize: 'src/tokenize.ts',
  'validate-route': 'src/validate-route.ts',
  'constraints/index': 'src/constraints/index.ts',
};

const declarationEntries = Object.fromEntries(
  Object.keys(entries).map((name) => [name, `dist/types/${name}.d.ts`]),
);

export default [
  {
    input: entries,
    external,
    output: [
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name]-[hash].cjs',
      },
    ],
    plugins: [
      resolve({ preferBuiltins: true }),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'dist/types',
      }),
    ],
  },
  {
    input: declarationEntries,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].d.ts',
    },
    plugins: [dts()],
  },
];
