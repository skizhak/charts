/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const Action = require('../plugins/Action')

class OnClick extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (data, clickHandler) {
    const chart = this._registrar
    clickHandler(data, chart)
  }
}

module.exports = OnClick
