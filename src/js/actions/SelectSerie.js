const Action = require('../plugins/Action')

class SelectSerie extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectSerie'
    this._deny = false
  }

  _execute (plot) {
    const chart = this.registrar
    if (chart._isEnabledComponent('filter')) {
      const filter = chart.getComponentByType('filter')
      filter.config.set('plot', plot)
    }
    if (chart._isEnabledComponent('compositeY')) {
      const compositeY = chart.getComponentByType('compositeY')
      compositeY.config.trigger('change:plot')
    }
  }
}

module.exports = SelectSerie
