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

      getFormattedData (inData) {
        let outData = {}
        const dataConfig = this.get('dataConfig')
        const titleConfig = this.get('title')

        if (titleConfig) {
          outData.title = _.isString(titleConfig) ? titleConfig : this.getFormattedValue(inData, titleConfig)
        }

        outData.color = this.get('color')
        outData.backgroundColor = this.get('backgroundColor')

        outData.items = _.map(dataConfig, datumConfig => {
          return {
            label: this.getLabel(inData, datumConfig),
            value: this.getFormattedValue(inData, datumConfig),
          }
        })

        return outData
      }
    }
  }
}

module.exports = TooltipConfigModel
