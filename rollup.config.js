import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

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
      })
    ]
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

