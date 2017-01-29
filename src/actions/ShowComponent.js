const Action = require('../plugins/Action')

class ShowComponent extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (id, ...args) {
    this._registrar.getComponent(id).show(...args)
  }
}

module.exports = ShowComponent
