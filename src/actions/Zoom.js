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
    _.each(componentIds, id => {
      const component = chart.getComponent(id)
      if (component) component.zoom(...args)
    })
  }
}
