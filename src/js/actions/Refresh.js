const _ = require('lodash')
const Action = require('../plugins/Action')

class Refresh extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, color) {
    const chart = this._registrar

    _.each(chart.getComponentsByType('CompositeYChartView'), (compositeY) => {
      compositeY.config.trigger('change', compositeY.config)
    })

    _.each(chart.getComponentsByType('NavigationView'), (navigation) => {
      navigation.config.trigger('change', navigation.config)
    })

    _.each(chart.getComponentsByType('PieChartView'), (pieChart) => {
      pieChart.config.trigger('change', pieChart.config)
    })
  }
}

module.exports = Refresh
