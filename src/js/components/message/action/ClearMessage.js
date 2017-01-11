const Action = require('../../../plugins/Action')

class Self extends Action {
  constructor (p) {
    super(p)
    this._id = 'messageClear'
    this._label = 'Clear Message'
    this._icon = 'fa fa-eraser'
    this._deny = false
  }

  _execute (p) {
    this.registrar.clear(p)
  }
}

module.exports = Self
