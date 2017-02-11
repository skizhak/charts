/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class LegendConfigModel extends ContrailChartsConfigModel {
  /**
   * Ask parent component for serie accessors
   */
  get data () {
    const accessors = this._parent.getAccessors()
    return _.map(accessors, (accessor) => {
      return {
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor([], accessor),
      }
    })
  }
}

module.exports = LegendConfigModel
