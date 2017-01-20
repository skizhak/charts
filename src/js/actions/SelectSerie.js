const _ = require('lodash')
const Action = require('../plugins/Action')

class SelectSerie extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectSerie'
    this._deny = false
  }

  _execute (plot) {
    const chart = this.registrar
    _.each(chart.getComponentsByType('filter'), (filter) => filter.config.set('plot', plot))
    _.each(chart.getComponentsByType('compositeY'), (compositeY) => {
      compositeY.config.trigger('change', compositeY.config)
    })
  }
}

module.exports = SelectSerie
