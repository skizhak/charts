/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global d3 */

const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class LegendPanelConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      palette: d3.schemeCategory20,
      editable: true
    }
  }

  get data () {
    const accessors = this._parent.getAccessors()
    const data = {
      colors: this.attributes.palette,
      editable: this.attributes.editable
    }

    data.attributes = _.map(accessors, (accessor) => {
      return {
        accessor: accessor.accessor,
        axis: accessor.axis,
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor),
        checked: accessor.enabled,
      }
    })

    return data
  }
}

module.exports = LegendPanelConfigModel
