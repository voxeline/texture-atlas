const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'entry.ts'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './dist',
    open: true,
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', ''],
  },
  resolveLoader: {
    fallback: path.join(__dirname, 'node_modules'),
  },
  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
    loaders: [
      { test: /\.ts(x?)$/, loader: `ts-loader` },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'index.html' },
      { from: 'style.css' },
    ]),
  ],
};
