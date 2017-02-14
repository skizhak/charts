/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const Events = require('contrail-charts-events')
/**
 * Action Manager
 */
class Actionman {
  constructor () {
    this._id = undefined
    this._instances = {}
  }

  set id (id) {
    this._id = id
  }

  get id () {
    return this._id
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
  /**
   * @param {Action} Action class to be instantiated
   * @return {Action} found or instantiated action
   */
  set (Action, registrar) {
    const action = new Action({ registrar })
    if (this._instances[Action.name] === action) return

    this._instances[Action.name] = action
    this.trigger('add', action)
    return action
  }
  /**
   * unset Action from a registrar
   * @param Action
   * @param registrar
   */
  unset (Action, registrar) {
    if (this._instances[Action.name]) {
      this._instances[Action.name].unRegister(registrar)
    }
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

    if (!_.isNil(action)) {
      action.apply(this.id, ...args)
    }
  }
}
// TODO replace with class extends syntax
_.extend(Actionman.prototype, Events)

module.exports = Actionman
