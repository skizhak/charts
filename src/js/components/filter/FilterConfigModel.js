/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
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
}

module.exports = FilterConfigModel
