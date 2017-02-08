/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

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

    outData.color = this.get('color')
    outData.backgroundColor = this.get('backgroundColor')

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
