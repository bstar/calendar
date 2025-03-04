import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

export default {
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
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      inlineSources: true
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs(),
    postcss({
      extensions: ['.css']
    })
  ],
  external: ['react', 'react-dom', 'date-fns', 'lodash-es']
}; 