/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class BrushConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // The selection to use when first rendered [xMin%, xMax%].
      selection: [0, 100]
    }
  }
}

module.exports = BrushConfigModel
