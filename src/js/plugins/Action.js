const _ = require('lodash')
const Events = require('contrail-charts-events')
/**
 * A "Command" object
 * @event enable
 * @event disable
 */
class Action {
  constructor (p = {}) {
    this.registrar = p.registrar
    this._id = p.id
    this._deny = true
  }
  /**
   * Execute the action code
   */
  apply (...args) {
    if (this._deny) return undefined

    if (this._execute) {
      return this._execute(...args)
    }
    return undefined
  }
  /**
   * Override in Concrete Command
   */
  _execute () {
  }
  /**
   * Evaluate enabled state on selection change
   * @param selection Array
   */
  evaluate (selection) {
  }
  /**
   * Toggle enabled state
   */
  _evaluate (enable) {
    enable ? this.enable() : this.disable()
  }
  /**
   * Id getter prevents id from change
   */
  get id () {
    return this._id
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
}
// TODO replace with class extends syntax
_.extend(Action.prototype, Events)

module.exports = Action
