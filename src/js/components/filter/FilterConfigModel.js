/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class FilterConfigModel extends ContrailChartsConfigModel {
  get data () {
    return this._parent.get('plot')
  }

  set parent (model) {
    this._parent = model
    model.on('change', () => {
      this.trigger('change')
    })
  }

  filter (accessor) {
    const series = this._parent.get('plot').y
    const serieConfig = _.find(series, {accessor})
    serieConfig.enabled = !serieConfig.enabled
  }
}

module.exports = FilterConfigModel
