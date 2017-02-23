/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {join} from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

let fileName = 'contrail-charts'
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
  /**
   * By default we will exclude bundling d3 modules with library.
   * To make it easier to use this library, all modules are resolved to d3.
   * Keep d3 version 4 in global scope or in amd scenario, export d3 version 4 as d3v4.
   * In the case of co-existing with older version of d3:
   *  1. in amd, use d3 to point to older version and use d3v4 to point to version 4
   *  2. other cases, use library bundled with the d3 v4 modules. build library with 'npm run build:lib:withD3'
   *     use the built contrail-charts.bundle.js or min file
   *  Note: updating d3 specific module, update package.json run target build:lib:withD3
   */
  const externals = {
    'jquery': {amd: 'jquery', root: 'jQuery'},
    'd3': {amd: 'd3v4', root: 'd3'},
    'd3-selection': {amd: 'd3v4', root: 'd3'},
    'd3-scale': {amd: 'd3v4', root: 'd3'},
    'd3-shape': {amd: 'd3v4', root: 'd3'},
    'd3-array': {amd: 'd3v4', root: 'd3'},
    'd3-axis': {amd: 'd3v4', root: 'd3'},
    'd3-ease': {amd: 'd3v4', root: 'd3'},
    'd3-brush': {amd: 'd3v4', root: 'd3'},
    'd3-time-format': {amd: 'd3v4', root: 'd3'},
    'd3-hierarchy': {amd: 'd3v4', root: 'd3'},
    'lodash': {amd: 'lodash', root: '_'},
    'backbone': {amd: 'backbone', root: 'Backbone'},
  }

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

  // For every library added in the include env, we will remove from externals.
  if (env.include) {
    env.include.split(',').forEach((lib) => {
      delete externals[lib.trim()]
    })
    // Will append .bundle to the output file name.
    fileName = `${fileName}.bundle`
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
    externals: externals,
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
