const Action = require('../../../plugins/Action')

class ClearMessage extends Action {
  constructor (p) {
    super(p)
    this._id = 'messageClear'
    this._deny = false
  }

  _execute (msgObj) {
    this.registrar.clear(msgObj)
  }
}

module.exports = ClearMessage
