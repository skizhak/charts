/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const Events = require('contrail-charts-events')
/**
 * A "Command" object
 * @event enable
 * @event disable
 */
let instances = {}
class Action {
  constructor (p = {}) {
    if (!instances[this.id]) instances[this.id] = this
    const instance = instances[this.id]

    instance.registrars = instance.registrars || []
    if (!_.includes(instance.registrars, p.registrar)) instance.registrars.push(p.registrar)

    instance._deny = true
    return instance
  }
  /**
   * Action is a Singleton so constructor name is effectively used as an id
   */
  get id () {
    return this.constructor.name
  }
  /**
   * Execute the action code
   */
  apply (...args) {
    if (this._deny) return undefined

    if (this._execute) {
      _.each(this.registrars, registrar => {
        this._registrar = registrar
        this._execute(...args)
        this._registrar = undefined
      })
    }
    return undefined
  }
  /**
   * Changes enable/disable state
   * Notifies "disable" Event
   */
  disable () {
    if (this._deny) return
    this._deny = true
    this.trigger('disable')
  }
  /**
   * Changes enable/disable state
   * Notifies "enable" Event
   */
  enable () {
    if (!this._deny) return
    this._deny = false
    this.trigger('enable')
  }
  /**
   * @returns Boolean whether Action has undo method
   */
  canUndo () {
    return !!this._undo
  }

  isEnabled () {
    return !this._deny
  }
  /**
   * Evaluate enabled state on selection change
   * @param selection Array
   */
  evaluate (selection) {
  }
  /**
   * Override in Concrete Command
   */
  _execute () {
  }
  /**
   * Toggle enabled state
   */
  _evaluate (enable) {
    enable ? this.enable() : this.disable()
  }
}
// TODO replace with class extends syntax
_.extend(Action.prototype, Events)

module.exports = Action
