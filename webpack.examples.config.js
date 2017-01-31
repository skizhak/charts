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
    'demoloader': path.join(__dirname, '/examples/common/js/demoLoader.js'),
    'devloader': path.join(__dirname, '/examples/common/js/devLoader.js'),
    'demo-bubble-port-distribution': path.join(__dirname, '/examples/demo/bubble-chart/port-distribution/port-distribution.js'),
    'demo-bubble-nodes': path.join(__dirname, '/examples/demo/bubble-chart/nodes/nodes.js'),
    'demo-linebar-cpu-mem': path.join(__dirname, '/examples/demo/linebar-chart/cpu-mem/cpu-mem.js'),
    'demo-linebar-query-db': path.join(__dirname, '/examples/demo/linebar-chart/query-db-rw/query-db.js'),
    'demo-area-vr-traffic': path.join(__dirname, '/examples/demo/area-chart/vrtraffic/vrtraffic.js'),
    'demo-area-in-out-traffic': path.join(__dirname, '/examples/demo/area-chart/in-out-traffic/inouttraffic.js'),
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
