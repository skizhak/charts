/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailModel = require('contrail-model')

class ContrailChartsConfigModel extends ContrailModel {
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

  getValue (data, datumConfig) {
    const getValue = datumConfig.accessor
    if (_.isNil(data)) return undefined
    if (_.isFunction(getValue)) return getValue(data)
    if (_.isString(getValue)) return _.get(data, getValue)
    return data
  }
  /**
   * @param {Array} data extract label from data source
   * @param {Object} datumConfig config on how to extract label from data data
   */
  getFormattedValue (data, datumConfig) {
    const formatter = datumConfig.valueFormatter
    const value = this.getValue(data, datumConfig)
    if (_.isFunction(formatter)) return formatter(value)
    return value
  }
  /**
   * @param {Array} data extract label from data source
   * @param {Object} datumConfig config on how to extract label from data data
   */
  getLabel (data, datumConfig) {
    const getLabel = datumConfig.labelFormatter || datumConfig.label || datumConfig.accessor
    if (_.isString(getLabel)) return getLabel
    if (_.isNil(data)) return undefined
    if (_.isFunction(getLabel)) return getLabel(data)
  }
  /**
   * Enable / disable event triggering with data preperation for specified component
   * @param {String} type Component type
   * @param {Boolean} enable Change state of this component
   */
  toggleComponent (type, enable) {}
}

module.exports = ContrailChartsConfigModel
