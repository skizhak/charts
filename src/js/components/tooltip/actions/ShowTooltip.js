const Action = require('../../../plugins/Action')

class ShowTooltip extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (offset, data, id) {
    this._registrar.show(offset, data, id)
  }
}

module.exports = ShowTooltip
