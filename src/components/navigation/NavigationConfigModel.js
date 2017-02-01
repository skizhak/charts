/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class NavigationConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The difference by how much we want to modify the computed width.
      chartWidthDelta: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      // Scale to transform values from percentage based selection to visual coordinates
      selectionScale: d3.scaleLinear().domain([0, 100]),

      colorScale: d3.scaleOrdinal(d3.schemeCategory20),
      // Duration of chart transitions.
      duration: 300,

      xTicks: 10,
      yTicks: 10,

      // Margin between label and chart
      labelMargin: 16,

      marginTop: 40,
      marginBottom: 40,
      marginLeft: 40,
      marginRight: 40,
      marginInner: 10,

      curve: d3.curveCatmullRom.alpha(0.5),

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

  getColor (accessor) {
    if (_.has(accessor, 'color')) {
      return accessor.color
    } else {
      return this.attributes.colorScale(accessor.accessor)
    }
  }
}

module.exports = NavigationConfigModel
