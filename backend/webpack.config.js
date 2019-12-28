const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const terserOptions = {
  parallel: true,
  cache: true,
  sourceMap: true,
  terserOptions: {
    compress: {
      dead_code: true,
    },
    output: {
      comments: false,
    },
  },
};

function transformPackageJSON(content, environment) {
  // make package.json as small as possible -> removing unnecessary development dependencies
  const json = JSON.parse(content.toString());
  json.main = 'backend/app.js';
  json.scripts.start = `NODE_ENV=${environment} node -r dotenv/config ./backend/app.js`;
  delete json.scripts['build:dev'];
  delete json.scripts['build:prod'];
  delete json.scripts['devDependencies'];
  return Buffer.from(JSON.stringify(json), 'utf8');
}

module.exports = (argv) => {

  const isDevelopment = argv === 'development';

  return {
    entry: './src/index.ts',
    mode: 'production',
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'backend/app.js',
    },
    resolve: {
      // Add `.ts` as a resolvable extension.
      extensions: ['.ts', '.js'],
    },
    target: 'node',
    externals: [nodeExternals()],
    module: {
      rules: [
        // all files with a `.ts` extension will be handled by `ts-loader`
        {
          test: /\.ts?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin(terserOptions)],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({'process.env.NODE_ENV': `"${argv}"`}),
      new CopyPlugin([
        {from: './package-lock.json'},
        isDevelopment && {from: '../.elasticbeanstalk', to: '.elasticbeanstalk'},
        isDevelopment && {from: '../.ebextensions', to: '.ebextensions'},
        {from: '../web/build', to: 'web/build'},
        {from: './package.json', transform(content) {return transformPackageJSON(content, argv)}},
      ].filter(Boolean)),
    ],
  };
};
