import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {

  input: 'src/index.js',

  output: {
    file: 'dist/reductus.js',
    format: 'umd',
    name: 'reductus'
  },

  sourcemap: true,

  external: ['redux'],

  globals: { redux: 'redux' },

  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs({
      namedExports: {
        'redux-cake': ['addSlice', 'reduxCake', 'combineReducers']
      }
    }),
    babel({
      exclude: 'node_modules/**',
      presets: [
        [ 'env', { modules: false } ]
      ],
      plugins: [
        'transform-object-rest-spread'
      ]
    })
  ]

};
