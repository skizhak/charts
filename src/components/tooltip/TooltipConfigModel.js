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

      formatter (data) {
        let tooltipContent = {}
        const dataConfig = this.get('dataConfig')
        const titleConfig = this.get('title')

        if (titleConfig) {
          tooltipContent.title = _.isString(titleConfig) ? titleConfig : this.getFormattedValue(data, titleConfig)
        }

        // Todo move out color to be class based.
        tooltipContent.color = this.get('color')
        tooltipContent.backgroundColor = this.get('backgroundColor')

        tooltipContent.items = _.map(dataConfig, datumConfig => {
          return {
            label: this.getLabel(data, datumConfig),
            value: this.getFormattedValue(data, datumConfig),
          }
        })

        return tooltipContent
      }
    }
  }
}

module.exports = TooltipConfigModel
