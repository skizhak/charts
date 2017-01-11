const Action = require('../plugins/Action')

class Self extends Action {
  constructor (p = {}) {
    super(p)
    this._id = 'selectSerie'
    this._deny = false
    this._icon = 'fa fa-filter'
  }

  _execute (plot) {
    var chart = this.registrar
    if (chart._isEnabledComponent('filter')) {
      var filter = chart.getComponentByType('filter')
      filter.config.set('plot', plot)
    }
    if (chart._isEnabledComponent('compositeY')) {
      var compositeY = chart.getComponentByType('compositeY')
      compositeY.config.set('plot', plot)
    }
  }
}

module.exports = Self
