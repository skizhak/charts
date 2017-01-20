const _ = require('lodash')
const Action = require('../../../plugins/Action')

class ShowCrosshair extends Action {
  constructor (p) {
    super(p)
    this._deny = false
    this._throttled = _.throttle((...args) => this._throttledExecute(...args))
  }

  _execute (...args) {
    this._throttled(...args)
  }

  _throttledExecute (point, invoker) {
    const data = invoker.getCrosshairData(point)
    const config = invoker.getCrosshairConfig()
    this._registrar.show(data, point, config)
  }
}

module.exports = ShowCrosshair
