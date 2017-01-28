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

  getFormattedData (inData) {
    var outData = {}
    const dataConfig = this.get('dataConfig')

    if(this.get('title')) {
      outData.title = _.isString(this.get('title')) ? this.get('title') : this.getFormattedValue(inData, this.get('title'))
    }

    outData.items = _.map(dataConfig, (datumConfig) => {
      return {
        label: this.getLabel(inData, datumConfig),
        value: this.getFormattedValue(inData, datumConfig),
      }
    })

    return outData
  }
}

module.exports = TooltipConfigModel
