/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class RadialDendrogramConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,
    }
  }
}

module.exports = RadialDendrogramConfigModel
