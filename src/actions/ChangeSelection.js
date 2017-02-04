/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const Action = require('../plugins/Action')

class ChangeSelection extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (dataProvider, changeSelectionHandler) {
    const chart = this._registrar
    changeSelectionHandler(dataProvider, chart)
  }
}

module.exports = ChangeSelection
