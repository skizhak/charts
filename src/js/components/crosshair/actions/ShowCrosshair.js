const Action = require('../../../plugins/Action')

class ShowCrosshair extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (...args) {
    this._registrar.show(...args)
  }
}

module.exports = ShowCrosshair
