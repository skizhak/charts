// Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.

const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class TooltipConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // Which tooltip ids to accept. If empty accept all.
      acceptFilters: [],
    }
  }

  setParent (model) {
    this._parent = model
    model.on('change', () => {
      this.trigger('change')
    })
  }

  getFormattedData (inData) {
    var outData = {}
    const dataConfig = this.get('dataConfig')
    outData.title = dataConfig.title
    outData.items = _.map(dataConfig, (datumConfig) => {
      return {
        color: inData.color ? inData.color : this._parent.getColor(datumConfig),
        label: this.getLabel(inData, datumConfig),
        value: this.getFormattedValue(inData, datumConfig),
      }
    })

    return outData
  }
}

module.exports = TooltipConfigModel
