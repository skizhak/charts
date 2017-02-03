/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const Action = require('../plugins/Action')

class SelectChartType extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, chartType) {
    const chart = this._registrar

    _.each(chart.getComponentsByType('CompositeYChart'), (compositeY) => {
      const plot = compositeY.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.chart = chartType
        compositeY.config.trigger('change', compositeY.config)
      }
    })

    _.each(chart.getComponentsByType('Navigation'), (navigation) => {
      const plot = navigation.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.chart = chartType
        navigation.config.trigger('change', navigation.config)
      }
    })
  }
}

module.exports = SelectChartType
