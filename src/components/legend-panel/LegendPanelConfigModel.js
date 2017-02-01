/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')
const chartTypeIconMap = {
  'BarChart': 'fa-bar-chart',
  'LineChart': 'fa-line-chart',
  'AreaChart': 'fa-area-chart',
  'PieChart': 'fa-pie-chart'
}

class LegendPanelConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      palette: d3.schemeCategory20,
      editable: {
        colorSelector: true,
        chartSelector: true
      }
    }
  }

  get data () {
    const accessors = this._parent.getAccessors()
    const data = {
      colors: this.attributes.palette,
      possibleChartTypes: _.map(this._parent.attributes.possibleChartTypes, chartType => chartTypeIconMap[chartType]),
      editable: this.attributes.editable.colorSelector || this.attributes.editable.chartSelector
    }

    data.attributes = _.map(accessors, (accessor) => {
      return {
        accessor: accessor.accessor,
        axis: accessor.axis,
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor),
        chartType: chartTypeIconMap[accessor.chart],
        checked: accessor.enabled,
      }
    })

    return data
  }
}

module.exports = LegendPanelConfigModel
