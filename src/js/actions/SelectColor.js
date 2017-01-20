const _ = require('lodash')
const Action = require('../plugins/Action')

class SelectColor extends Action {
  constructor (p) {
    super(p)
    this._id = 'selectColor'
    this._deny = false
  }

  _execute (accessorName, color) {
    const chart = this.registrar

    _.each(chart.getComponentsByType('compositeY'), (compositeY) => {
      const plot = compositeY.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.color = color
        compositeY.config.trigger('change', compositeY.config)
      }
    })

    // Color Picker will be updated as it has CompositeY Config Model as a parent
    // as well as all CompositeY dependant components too

    _.each(chart.getComponentsByType('navigation'), (navigation) => {
      const plot = navigation.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.color = color
        navigation.config.trigger('change', navigation.config)
      }
    })
  }
}

module.exports = SelectColor
