const Action = require('../../../plugins/Action')

class ClearMessage extends Action {
  constructor (p) {
    super(p)
    this._id = 'messageClear'
    this._deny = false
  }

  _execute (p) {
    this.registrar.clear(p)
  }
}

module.exports = ClearMessage
