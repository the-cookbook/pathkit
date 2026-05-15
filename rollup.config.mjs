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
      },
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        entryFileNames: '[name].cjs',
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
    input: Object.fromEntries(
      Object.keys(entries).map((name) => [name, `dist/types/${name}.d.ts`]),
    ),
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].d.ts',
    },
    plugins: [dts()],
  },
];
