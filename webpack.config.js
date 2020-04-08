// @ts-check

const path = require('path');

/**
 * @type {Partial<import('ts-loader').Options>}
 */
const tsLoaderOptions = {
  onlyCompileBundledFiles: true,
  transpileOnly: true,
};

/**
 * @type {import('webpack').RuleSetRule}
 */
const tsLoader = {
  test: /\.tsx?$/,
  use: {loader: 'ts-loader', options: tsLoaderOptions},
};

/**
 * @param {string} apiName
 * @returns {import('webpack').Configuration}
 */
function createLambdaConfig(apiName) {
  return {
    target: 'node',
    node: {__dirname: false},
    entry: `./src/api/lambdas/${apiName}.ts`,
    output: {
      filename: `${apiName}.bundle.js`,
      path: path.resolve(__dirname, 'lib/api/lambdas'),
      libraryTarget: 'commonjs2',
    },
    module: {rules: [tsLoader]},
    resolve: {extensions: ['.js', '.json', '.ts', '.tsx']},
    devtool: 'inline-source-map',
  };
}

module.exports = [
  createLambdaConfig('authorize'),
  createLambdaConfig('redirect'),
];
