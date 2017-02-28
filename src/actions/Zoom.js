/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const Action = require('../plugins/Action')

export default class Zoom extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (componentIds, ...args) {
    const chart = this._registrar
    let components
    if (componentIds) components = _.map(componentIds, id => chart.getComponent(id))
    else components = chart.getComponentsByType('CompositeYChart')
    _.each(components, component => {
      if (component) component.zoom(...args)
    })
  }
}
