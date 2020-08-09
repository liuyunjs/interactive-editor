/**
 * @Description : rollup config
 * @Create on : 2019/11/18 23:55
 * @author liuyunjs
 * @version 0.0.1
 **/

import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const typescriptConfig = {
  typescript: require('typescript'),
};

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return id => pattern.test(id);
};

const deps = Object.keys(pkg.dependencies || {});
const peerDeps = Object.keys(pkg.peerDependencies || {});

const config = {
  input: pkg.entry || './index.tsx',
  external: makeExternalPredicate(deps.concat(peerDeps)),
};

const es = Object.assign({}, config, {
  output: {
    file: 'index.js',
    format: 'es',
    exports: 'named',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    typescript(typescriptConfig),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    commonjs(),
  ],
});

export default [es];
