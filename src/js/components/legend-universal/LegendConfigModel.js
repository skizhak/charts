/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class LegendConfigModel extends ContrailChartsConfigModel {
  set parent (model) {
    this._parent = model
    model.on('change', () => {
      this.trigger('change')
    })
  }
  /**
   * Ask parent component for labels and not dataProvider directly as some data series may be filtered out
   */
  getData (dataProvider) {
    const labels = this._parent.getLabels(dataProvider)
    return _.map(labels, (label) => {
      return {
        label: label,
        color: this._parent.getColor(label),
      }
    })
  }
}

module.exports = LegendConfigModel
