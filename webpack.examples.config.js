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
    'demo-loader': path.join(__dirname, '/examples/common/js/demo-loader.js'),
    'dev-loader': path.join(__dirname, '/examples/common/js/dev-loader.js'),
    'demo-bubble-port-distribution': path.join(__dirname, '/examples/demo/bubble-chart/port-distribution/port-distribution.js'),
    'demo-bubble-nodes': path.join(__dirname, '/examples/demo/bubble-chart/nodes/nodes.js'),
    'demo-linebar-cpu-mem': path.join(__dirname, '/examples/demo/linebar-chart/cpu-mem/cpu-mem.js'),
    'demo-linebar-query-db': path.join(__dirname, '/examples/demo/linebar-chart/query-db-rw/query-db.js'),
    'demo-area-vr-traffic': path.join(__dirname, '/examples/demo/area-chart/vr-traffic/vr-traffic.js'),
    'demo-area-inout-traffic': path.join(__dirname, '/examples/demo/area-chart/inout-traffic/inout-traffic.js'),
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/build/examples'),
    filename: 'js/' + '[name].js',
  },
  module: {loaders},
  plugins: plugins,
  stats: { children: false }
}

module.exports = config
