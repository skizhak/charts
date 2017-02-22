/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {join} from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

const fileName = 'contrail-charts'
const libraryName = 'coCharts'
const paths = {
  framework: 'plugins/backbone/',
  contrail: 'plugins/contrail/',
}
function absolute (...args) {
  return join(__dirname, ...args)
}
const defaultEnv = {'dev': true}

export default (env = defaultEnv) => {
  const plugins = []
  const rules = [{
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader']
    }),
  }, {
    test: /\.html/,
    loader: 'handlebars-loader',
  }, {
    loader: 'babel-loader',
    test: /\.js$/,
    include: /(src)/,
    query: {
      presets: ['es2015'],
    }
  }]

  if (env.prod) {
    plugins.push(new UglifyJSPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        keep_fnames: true,
      },
      sourceMap: true,
      include: /\.min\.js$/,
    }))
  }
  // Let's put css under css directory.
  plugins.push(new ExtractTextPlugin(fileName + '.css'))

  return {
    entry: {
      [fileName]: absolute('src/index.js'),
      [`${fileName}.min`]: absolute('src/index.js')
    },
    devtool: 'source-map',
    output: {
      path: absolute('build'),
      filename: '[name].js',
      library: libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: false,
    },
    module: {rules},
    externals: {
      jquery: { amd: 'jquery', root: 'jQuery' },
      d3: { amd: 'd3v4', root: 'd3' },
      d3Array: { amd: 'd3-array', root: 'd3-array' },
      lodash: { amd: 'lodash', root: '_' },
      backbone: { amd: 'backbone', root: 'Backbone' },
    },
    resolve: {
      modules: [absolute('src'), 'node_modules'],
      alias: {
        'contrail-model': paths.framework + 'ContrailModel',
        'contrail-view': paths.framework + 'ContrailView',
        'contrail-events': paths.framework + 'ContrailEvents',

        'contrail-charts-data-model': paths.contrail + 'ContrailChartsDataModel',
        'contrail-charts-config-model': paths.contrail + 'ContrailChartsConfigModel',
        'contrail-charts-view': paths.contrail + 'ContrailChartsView',
        'contrail-charts-events': paths.contrail + 'ContrailChartsEvents',
        'contrail-charts-utils': paths.contrail + 'ContrailChartsUtils',
      },
      extensions: ['.js'],
    },
    plugins: plugins,
    stats: { children: false }
  }
}
