const Action = require('../../../plugins/Action')

class SendMessage extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (msgObj) {
    this._registrar.show(msgObj)
  }
}

module.exports = SendMessage
