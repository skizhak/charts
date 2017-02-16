/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../plugins/Action'

export default class OnClick extends Action {
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
