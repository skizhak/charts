const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')
const env = require('yargs').argv.mode

const fileName = 'contrail-charts-examples'
const plugins = []
const loaders = [{
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
}, {
  test: /\.json$/,
  loader: 'json-loader'
}]

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    include: /\.min\.js$/,
    minimize: false,
  }))
  loaders.push({
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: /(node_modules)/,
    query: {
      presets: ['es2015']
    }
  })
}

plugins.push(new ExtractTextPlugin('css/' + fileName + '.css'))

const config = {
  entry: {
    'exampleLoader': path.join(__dirname, '/examples/common/js/exampleLoader.js'),
    'linebar': path.join(__dirname, '/examples/linebar/linebar.js'),
    'port-distribution': path.join(__dirname, '/examples/port-distribution/port-distribution.js')
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/build/examples'),
    filename: 'js/' + '[name].js',
  },
  module: {loaders},
  plugins: plugins
}

module.exports = config
