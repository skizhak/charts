/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../plugins/Action'

export default class ChangeSelection extends Action {
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
