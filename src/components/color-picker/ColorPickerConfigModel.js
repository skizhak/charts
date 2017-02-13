/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class ColorPickerConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      palette: d3.schemeCategory20,
    }
  }
  /**
   * Ask parent component for serie accessors
   */
  get data () {
    const data = {colors: this.attributes.palette}
    const accessors = this._parent.getAccessors()
    data.series = _.map(accessors, (accessor) => {
      return {
        accessor: accessor.accessor,
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor([], accessor),
      }
    })
    return data
  }
}

module.exports = ColorPickerConfigModel
