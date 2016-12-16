const _ = require('lodash')
const Events = require('contrail-charts-events')
/**
 * Action Manager
 */
class Self {
  constructor () {
    this._instances = {}
  }

  get (id) {
    return this._instances[id]
  }

  getAll () {
    return this._instances
  }

  getActive () {
    return _.filter(this._instances, action => action.isEnabled())
  }

  set (Action, registrar) {
    const action = new Action({ registrar })
    this._instances[action.id] = action
    this.trigger('add', action)
  }
  /**
   * Updates all actions state
   */
  update (selection) {
    _.values(this._instances).forEach(action => {
      action.evaluate(selection)
    })
  }
  /**
  * Fire an action based on its id
  * @param actionName String The id of the action
  */
  fire (actionName, ...args) {
    const action = this._instances[actionName]

    if (action !== null) {
      action.apply(args)
    }
  }
}
// TODO replace with class extends syntax
_.extend(Self.prototype, Events)

module.exports = Self
