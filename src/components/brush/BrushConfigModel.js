/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
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
    return (this.attributes.yRange[0] - this.attributes.yRange[1])
  }

  get extent () {
    return [
      [this.attributes.xRange[0], this.attributes.yRange[1]],
      [this.attributes.xRange[1], this.attributes.yRange[0]],
    ]
  }
}

module.exports = BrushConfigModel
