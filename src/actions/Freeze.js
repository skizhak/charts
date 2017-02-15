/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const Action = require('../plugins/Action')

module.exports = class Freeze extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (...args) {
    const chart = this._registrar
    chart.frozen = true
    _.each(chart.getComponentsByType('ControlPanel'), controlPanel => {
      const menuItems = controlPanel.config.get('menu')
      const menuItem = _.find(menuItems, item => item.id === this.constructor.name)
      menuItem.id = 'Unfreeze'
      controlPanel.config.trigger('change', controlPanel.config)
    })
  }
}
