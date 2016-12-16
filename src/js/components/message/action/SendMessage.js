var _ = require('lodash')
var Action = require('../../../plugins/Action')

class Self extends Action {
  constructor (p) {
    super(p)
    this._id = 'messageSend'
    this._label = 'Send Message'
    this._icon = 'fa fa-edit'
    this._deny = false
  }

  _execute (msgObj) {
    this.registrar.renderMessage(msgObj)
  }
}

module.exports = Self
