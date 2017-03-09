/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailModel from 'contrail-model'

export default class ContrailChartsConfigModel extends ContrailModel {
  /**
   * @return {String} this class name without 'ConfigModel'
   */
  get type () {
    return this.constructor.name.slice(0, -11)
  }
  /**
  * Initialize the computed parameters with the config parameters.
  */
  computeParams () {
    this._computed = {}
    return _.extend(this._computed, JSON.parse(JSON.stringify(this.toJSON())))
  }

  set parent (model) {
    model.on('change', () => { this.trigger('change') })
    this._parent = model
    this.trigger('change')
  }
  /**
   * @param {Object} data to extract value from
   * @param {Object} config on how to extract
   */
  getValue (data, config = {}) {
    const getValue = config.accessor
    if (_.isNil(data)) return undefined
    if (_.isFunction(getValue)) return getValue(data)
    if (_.isString(getValue)) return _.get(data, getValue)
    return data
  }
  /**
   * @param {Object} data to extract formatted value from
   * @param {Object} config on how to extract
   */
  getFormattedValue (data, config = {}) {
    const formatter = config.valueFormatter
    const value = this.getValue(data, config)
    if (_.isFunction(formatter)) return formatter(value)
    return value
  }
  /**
   * @param {Object} data to extract label from
   * @param {Object} config on how to extract label from data
   */
  getLabel (data, config = {}) {
    const getLabel = config.labelFormatter || config.label || config.accessor
    if (_.isString(getLabel)) return getLabel
    if (_.isNil(data)) return undefined
    if (_.isFunction(getLabel)) return getLabel(data)
  }
  /**
   * @param {Object} data to extract label from
   * @param {Object} config on how to extract label from data
   * TODO should the getColor function if provided be evaluated on empty data?
   * Legend Panel needs to display a color not for particular data point but for the whole serie
   */
  getColor (data, config = {}) {
    const getColor = config.color
    if (_.isString(getColor)) return getColor
    if (_.isNil(data)) return undefined
    if (_.isFunction(getColor)) return getColor(data)
  }
  /**
   * Enable / disable event triggering with data preperation for specified component
   * @param {String} type Component type
   * @param {Boolean} enable Change state of this component
   */
  toggleComponent (type, enable) {
    this.set(`${type}Enabled`, !enable, {silent: true})
  }
}
