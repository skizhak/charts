/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class Self extends ContrailChartsConfigModel {
  constructor (p = {}) {
    super(p)
  }

  setParent (model) {
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

  getData () {
    return this._parent.get('plot')
  }
}

module.exports = Self
