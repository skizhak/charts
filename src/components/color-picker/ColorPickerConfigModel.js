/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import 'd3'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class ColorPickerConfigModel extends ContrailChartsConfigModel {
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
