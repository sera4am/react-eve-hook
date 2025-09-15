import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const production = process.env.NODE_ENV === 'production';

export default [
  // Build the main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external: ['react', 'mitt'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.*', '**/*.spec.*']
      }),
      production && terser()
    ].filter(Boolean)
  },
  // Build the type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];

