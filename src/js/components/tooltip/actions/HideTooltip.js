const Action = require('../../../plugins/Action')

class HideTooltip extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (id) {
    this._registrar.hide(id)
  }
}

module.exports = HideTooltip
