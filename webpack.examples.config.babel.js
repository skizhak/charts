/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {join} from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

const fileName = 'contrail-charts-examples'
const paths = {
  dev: 'examples/developer',
  demo: 'examples/demo/',
}
function absolute (...args) {
  return join(__dirname, ...args)
}
const defaultEnv = paths.dev

export default (env = defaultEnv) => {
  const plugins = [
    new ExtractTextPlugin('css/' + fileName + '.css'),
  ]
  const loaders = [{
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader']
    }),
  }]

  if (env === 'build') {
    plugins.push(new UglifyJSPlugin({
      include: /\.min\.js$/,
      minimize: false,
    }))
  }
  loaders.push({
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: /(node_modules)/,
    query: {
      presets: ['es2015']
    }
  })

  return {
    entry: {
      'demo-loader': absolute('examples/common/js/demo-loader'),
      'dev-loader': absolute('examples/common/js/dev-loader'),

      'demo/port-distribution': absolute(paths.demo, 'bubble-chart/port-distribution/port-distribution'),
      'demo/nodes': absolute(paths.demo, 'bubble-chart/nodes/nodes'),
      'demo/vrouter-vmi': absolute(paths.demo, 'bubble-chart/vrouter-vmi/vrouter-vmi'),
      'demo/cpu-mem': absolute(paths.demo, 'linebar-chart/cpu-mem/cpu-mem'),
      'demo/query-db': absolute(paths.demo, 'linebar-chart/query-db-rw/query-db'),
      'demo/vr-traffic': absolute(paths.demo, 'area-chart/vr-traffic/vr-traffic'),
      'demo/inout-traffic': absolute(paths.demo, 'area-chart/inout-traffic/inout-traffic'),
      'demo/disk-usage': absolute(paths.demo, 'radial-chart/disk-usage/disk'),
      'demo/pool-usage': absolute(paths.demo, 'radial-chart/pool-usage/pools'),
      'demo/vn-detail': absolute(paths.demo, 'grouped-chart/vn-detail/vn-detail'),
      'demo/cnode': absolute(paths.demo, 'grouped-chart/compute-node/cnode'),
      'demo/vr-vn-traffic': absolute(paths.demo, 'radial-chart/vr-vn-traffic/vr-vn-traffic'),

      'developer/multi-shape': absolute(paths.dev, 'bubble-chart/multiple-shapes/'),
      'developer/control-panel': absolute(paths.dev, 'linebar-chart/control-panel/'),
      'developer/area-chart': absolute(paths.dev, 'area-chart/basic/'),
      'developer/legend': absolute(paths.dev, 'linebar-chart/legend/'),
      'developer/timeline': absolute(paths.dev, 'linebar-chart/timeline/'),
      'developer/lb-tooltip': absolute(paths.dev, 'linebar-chart/tooltip/'),
      'developer/live': absolute(paths.dev, 'linebar-chart/live/'),
      'developer/grouped-bar': absolute(paths.dev, 'linebar-chart/grouped-bar-chart/'),
      'developer/stacked-bar': absolute(paths.dev, 'linebar-chart/stacked-bar-chart/'),
      'developer/navigation': absolute(paths.dev, 'linebar-chart/navigation/'),
      'developer/pie': absolute(paths.dev, 'radial-chart/pie/'),
      'developer/dendrogram': absolute(paths.dev, 'radial-chart/dendrogram/'),
      'developer/lb-lb-nav': absolute(paths.dev, 'grouped-chart/linebar-linebar-nav/'),
      'developer/lb-pie-nav': absolute(paths.dev, 'grouped-chart/linebar-pie-nav/'),
    },
    devtool: 'source-map',
    output: {
      path: absolute('/build/examples'),
      filename: '[name].bundle.js'
    },
    module: {loaders},
    externals: {
      jquery: { amd: 'jquery', root: 'jQuery' },
      d3: { amd: 'd3v4', root: 'd3' },
      lodash: { amd: 'lodash', root: '_' },
      backbone: { amd: 'backbone', root: 'Backbone' },
    },
    resolve: {
      modules: [join(__dirname), 'node_modules'],
      alias: {
        'fixture': 'tests/generator.js',
        'formatter': 'examples/common/js/value-formatters.js',
        'constants': 'examples/common/js/constants.js',
        'commons': 'examples/common/js/commons.js',
        'data-generator': 'examples/common/js/data-generator.js'
      },
      extensions: ['.js']
    },
    plugins: plugins,
    stats: { children: false }
  }
}
