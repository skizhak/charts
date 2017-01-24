/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class PieChartConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // sets the position for shared svg container
      isPrimary: true,

      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      colorScale: d3.scaleOrdinal(d3.schemeCategory20),
    }
  }

  get innerRadius () {
    const chartType = this.get('type')
    const innerRadiusCoefficient = chartType === 'pie' ? 0 : 0.75
    return this.get('radius') * innerRadiusCoefficient
  }

  getColor (accessor) {
    return this.attributes.colorScale(accessor)
  }

  getLabels (dataProvider) {
    const labelFormatter = this.get('serie').getLabel
    return dataProvider.getLabels(labelFormatter)
  }
}

module.exports = PieChartConfigModel
