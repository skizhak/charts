/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')

/**
* This CrosshairConfigModel is designed to prepare data for CrosshairView based on the CompositeYChartView.
*/
    isSvg: true
class CrosshairConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // by default will use common shared container under the parent
      duration: 100,
      bubbleR: 5,
    }
  }
}

module.exports = CrosshairConfigModel
