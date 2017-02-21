/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global requirejs */
requirejs.config({ // eslint-disable-line
  paths: {
    app: 'app',
    'underscore': '../../../../node_modules/underscore/underscore',
    'babel': '../../../../node_modules/requirejs-babel/babel-5.8.34.min',
    'es6': '../../../../node_modules/requirejs-babel/es6',
    'contrail-charts': '../../../../build/src/js/contrail-charts',
    'jquery': '../../../../node_modules/jquery/dist/jquery',
    'backbone': '../../../../node_modules/backbone/backbone',
    'd3v4': '../../../../node_modules/d3/build/d3',
    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min', // Example use of multiple d3 versions. This points to older d3 version used in existing codebase.
    'lodash': '../../../../node_modules/lodash/lodash'
  },
  waitSeconds: 20
})

// Start the main app logic.
requirejs(['app/example'], function (example) {
  window.AMDChartInstance[['lineBar', 'RequireJS'].join('')] = example
})
