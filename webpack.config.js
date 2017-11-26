const path = require('path');
const nodeExternals = require('webpack-node-externals');

const common = {
  target: 'node',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ['babel-loader', 'awesome-typescript-loader'] },
    ],
  },
  externals: [nodeExternals()],
};

const server = {
  entry: './server/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.bundle.js',
  },
};

const tools = {
  entry: './elecsh.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tools.bundle.js',
  },
};

module.exports = [
  Object.assign({}, common, server),
  Object.assign({}, common, tools),
];
