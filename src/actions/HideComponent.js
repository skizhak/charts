const Action = require('../plugins/Action')

class HideComponent extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (id, ...args) {
    this._registrar.getComponent(id).hide(...args)
  }
}

module.exports = HideComponent
