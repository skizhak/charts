/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global d3 */

const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')
const chartTypeIconMap = {
  'BarChart': 'fa-bar-chart',
  'StackedBarChart': 'fa-signal', // Todo find something better
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
      },
      filter: true,
      placement: 'horizontal'
    }
  }

  get data () {
    const accessors = this._parent.getAccessors()
    const axesCount = _.chain(accessors).map('axis').uniq().value().length

    const data = {
      colors: this.attributes.palette,
      possibleChartTypes: _.map(this._parent.attributes.possibleChartTypes, (chartType) => {
        return {
          chartType: chartType,
          chartIcon: chartTypeIconMap[chartType]
        }
      }),
      editable: this.attributes.editable.colorSelector || this.attributes.editable.chartSelector,
      axesCount: axesCount
    }

    data.attributes = _.map(accessors, accessor => {
      return {
        accessor: accessor.accessor,
        axis: accessor.axis,
        label: this.getLabel([], accessor),
        color: this._parent.getColor([], accessor),
        chartType: accessor.chart,
        chartIcon: chartTypeIconMap[accessor.chart],
        checked: this.attributes.filter ? accessor.enabled : true,
        shape: accessor.shape,
      }
    })

    return data
  }
}

module.exports = LegendPanelConfigModel
