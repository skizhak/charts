/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class BrushConfigModel extends ContrailChartsConfigModel {

  /**
   * Brush selection in percentage [xMin%, xMax%]
   */
  get selection () {
    return this.attributes.selection || []
  }

  get duration () {
    return this.attributes.duration
  }

  get handleHeight () {
    return this.has('handleHeight') ? this.attributes.handleHeight : 16
  }

  get handleCenter () {
    const extent = this.attributes.extent
    return (extent[1][1] - extent[0][1]) / 2
  }
}

module.exports = BrushConfigModel
