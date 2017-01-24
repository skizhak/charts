const _ = require('lodash')
const Action = require('../plugins/Action')

class Refresh extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, color) {
    const chart = this._registrar

    _.each(chart.getComponentsByType('compositeY'), (compositeY) => {
      compositeY.config.trigger('change', compositeY.config)
    })

    _.each(chart.getComponentsByType('navigation'), (navigation) => {
      navigation.config.trigger('change', navigation.config)
    })

    _.each(chart.getComponentsByType('pieChart'), (pieChart) => {
      pieChart.config.trigger('change', pieChart.config)
    })
  }
}

module.exports = Refresh
