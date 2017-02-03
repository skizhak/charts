/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class FilterConfigModel extends ContrailChartsConfigModel {
  get data () {
    const accessors = this._parent.getAccessors()
    const data = _.map(accessors, (accessor) => {
      return {
        key: accessor.accessor,
        label: this.getLabel(undefined, accessor),
        enabled: accessor.enabled,
      }
    })

    return data
  }
}

module.exports = FilterConfigModel
