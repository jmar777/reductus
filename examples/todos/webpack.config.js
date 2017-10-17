const webpack = require('webpack'),
      path = require('path'),
      HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',

  entry: ['./src/index.js'],

  output: {
    publicPath: '/',
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules'],
    symlinks: false
  },

  module: {
    rules: [{
      test: /\.(jsx|js)$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: [
          'babel-preset-react',
          'babel-preset-es2015',
          'babel-preset-stage-3'
        ].map(require.resolve),
        plugins: [
          'babel-plugin-transform-decorators-legacy',
          'babel-plugin-transform-object-rest-spread',
          'babel-plugin-transform-runtime'
        ].map(require.resolve)
      }
    }]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
      files: {
        js: ['bundle.js']
      }
    })
  ]
};
