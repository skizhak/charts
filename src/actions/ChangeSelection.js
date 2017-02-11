/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const Action = require('../plugins/Action')

class ChangeSelection extends Action {
  constructor (p) {
    super(p)
    this._deny = false
    this._triggerAll = true
  }

  _execute (dataProvider, changeSelectionHandler) {
    const chart = this._registrar
    changeSelectionHandler(dataProvider, chart)
  }
}

module.exports = ChangeSelection
