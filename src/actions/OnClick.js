/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const Action = require('../plugins/Action')

class OnClick extends Action {
  constructor (p) {
    super(p)
    this._deny = false
    this._triggerAll = true
  }

  _execute (data, el, clickHandler) {
    const chart = this._registrar
    clickHandler(data, el, chart)
  }
}

module.exports = OnClick
