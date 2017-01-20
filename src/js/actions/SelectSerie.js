const _ = require('lodash')
const Action = require('../plugins/Action')

class SelectSerie extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectSerie'
    this._deny = false
  }

  _execute (accessorName, isSelected) {
    const chart = this.registrar
    _.each(chart.getComponentsByType('compositeY'), (compositeY) => {
      const plot = compositeY.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.enabled = isSelected
        compositeY.config.trigger('change', compositeY.config)
      }
    })

    // Filter will be updated as it has CompositeY Config Model as a parent
    // as well as all CompositeY dependant components too

    _.each(chart.getComponentsByType('navigation'), (navigation) => {
      const plot = navigation.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.enabled = isSelected
        navigation.config.trigger('change', navigation.config)
      }
    })
  }
}

module.exports = SelectSerie
