const Action = require('../../../plugins/Action')

class ClearMessage extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (msgObj) {
    this._registrar.clear(msgObj)
  }
}

module.exports = ClearMessage
