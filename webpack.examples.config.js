/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

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

    'demo/port-distribution': path.join(__dirname, '/examples/demo/bubble-chart/port-distribution/port-distribution.js'),
    'demo/nodes': path.join(__dirname, '/examples/demo/bubble-chart/nodes/nodes.js'),
    'demo/vrouter-vmi': path.join(__dirname, '/examples/demo/bubble-chart/vrouter-vmi/vrouter-vmi.js'),
    'demo/cpu-mem': path.join(__dirname, '/examples/demo/linebar-chart/cpu-mem/cpu-mem.js'),
    'demo/query-db': path.join(__dirname, '/examples/demo/linebar-chart/query-db-rw/query-db.js'),
    'demo/vr-traffic': path.join(__dirname, '/examples/demo/area-chart/vr-traffic/vr-traffic.js'),
    'demo/inout-traffic': path.join(__dirname, '/examples/demo/area-chart/inout-traffic/inout-traffic.js'),
    'demo/disk-usage': path.join(__dirname, '/examples/demo/radial-chart/disk-usage/disk.js'),
    'demo/pool-usage': path.join(__dirname, '/examples/demo/radial-chart/pool-usage/pools.js'),
    'demo/vn-detail': path.join(__dirname, '/examples/demo/grouped-chart/vn-detail/vn-detail.js'),
    'demo/cnode': path.join(__dirname, '/examples/demo/grouped-chart/compute-node/cnode.js'),
    'demo/vr-vn-traffic': path.join(__dirname, '/examples/demo/radial-chart/vr-vn-traffic/vr-vn-traffic.js'),

    'developer/multi-shape': path.join(__dirname, '/examples/developer/bubble-chart/multiple-shapes/'),
    'developer/control-panel': path.join(__dirname, '/examples/developer/linebar-chart/control-panel/'),
    'developer/area-chart': path.join(__dirname, '/examples/developer/area-chart/basic/'),
    'developer/legend': path.join(__dirname, '/examples/developer/linebar-chart/legend/'),
    'developer/timeline': path.join(__dirname, '/examples/developer/linebar-chart/timeline/'),
    'developer/lb-tooltip': path.join(__dirname, '/examples/developer/linebar-chart/tooltip/'),
    'developer/live': path.join(__dirname, '/examples/developer/linebar-chart/live/'),
    'developer/grouped-bar': path.join(__dirname, '/examples/developer/linebar-chart/grouped-bar-chart/'),
    'developer/navigation': path.join(__dirname, '/examples/developer/linebar-chart/navigation/'),
    'developer/pie': path.join(__dirname, '/examples/developer/radial-chart/pie/'),
    'developer/dendrogram': path.join(__dirname, '/examples/developer/radial-chart/dendrogram/'),
    'developer/lb-lb-nav': path.join(__dirname, '/examples/developer/grouped-chart/linebar-linebar-nav/'),
    'developer/lb-pie-nav': path.join(__dirname, '/examples/developer/grouped-chart/linebar-pie-nav/'),
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/build/examples'),
    filename: 'js/' + '[name].bundle.js'
  },
  module: {loaders},
  externals: {
    jquery: { amd: 'jquery', root: 'jQuery' },
    d3: { amd: 'd3v4', root: 'd3' },
    lodash: { amd: 'lodash', root: '_' },
    backbone: { amd: 'backbone', root: 'Backbone' },
  },
  resolve: {
    root: './',
    alias: {
      'fixture': 'tests/generator.js',
      'formatter': 'examples/common/js/value-formatters.js',
      'constants': 'examples/common/js/constants.js',
      'commons': 'examples/common/js/commons.js',
      'data-generator': 'examples/common/js/data-generator.js'
    },
    extensions: ['', '.js']
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  plugins: plugins,
  stats: { children: false }
}

module.exports = config
