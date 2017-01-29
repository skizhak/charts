/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')

/**
* Component to test rendering of vector contents as standalone
*/
class StandaloneModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // by default will use shared container under the parent
      isSharedContainer: true,
      chartWidth: 300,
      chartHeight: 100,
    }
  }
}

module.exports = StandaloneModel
