/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class ColorPickerConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      colorScheme: d3Scale.schemeCategory20,
    }
  }
  /**
   * Ask parent component for serie accessors
   */
  get data () {
    const data = {colors: this.attributes.colorScheme}
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
