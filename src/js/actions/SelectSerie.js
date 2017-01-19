const Action = require('../plugins/Action')

class Self extends Action {
  constructor (p = {}) {
    super(p)
    this._id = 'selectSerie'
    this._deny = false
    this._icon = 'fa fa-filter'
  }

  _execute (plot) {
    const chart = this.registrar
    if (chart._isEnabledComponent('filter')) {
      const filter = chart.getComponentByType('filter')
      filter.config.set('plot', plot)
    }
    if (chart._isEnabledComponent('compositeY')) {
      const compositeY = chart.getComponentByType('compositeY')
      compositeY.config.set('plot', plot)
    }
  }
}

module.exports = Self
