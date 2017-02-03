/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const Action = require('../plugins/Action')

class HideComponent extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (id, ...args) {
    const component = this._registrar.getComponent(id)
    if (component) component.hide(...args)
  }
}

module.exports = HideComponent
