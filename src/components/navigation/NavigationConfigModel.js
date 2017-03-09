/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Shape from 'd3-shape'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class NavigationConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The difference by how much we want to modify the computed width.
      chartWidthDelta: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      // Scale to transform values from percentage based selection to visual coordinates
      selectionScale: d3Scale.scaleLinear().domain([0, 100]),

      colorScale: d3Scale.scaleOrdinal(d3Scale.schemeCategory20),
      // Duration of chart transitions.
      duration: 300,

      // Default axis ticks if not specified per axis.
      _xTicks: 10,
      _yTicks: 10,

      // Margin between label and chart
      labelMargin: 16,

      marginTop: 25,
      marginBottom: 40,
      marginLeft: 50,
      marginRight: 50,
      marginInner: 10,

      curve: d3Shape.curveCatmullRom.alpha(0.5),

      // The selection to use when first rendered [xMin%, xMax%].
      selection: [],
    }
  }

  get selectionRange () {
    this.attributes.selectionScale.range([this.attributes.xRange[0], this.attributes.xRange[1]])
    if (_.isEmpty(this.attributes.selection)) return []
    return [
      this.attributes.selectionScale(this.attributes.selection[0]),
      this.attributes.selectionScale(this.attributes.selection[1]),
    ]
  }

  getColor (data, accessor) {
    const configuredColor = super.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor.accessor)
  }
}
