/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
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

      // General margin used for computing the side margins.
      margin: 30,

      // Side margins. Will be computed if undefined.
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
      marginInner: 0,

      curve: d3.curveCatmullRom.alpha(0.5),

      // The selection to use when first rendered [xMin%, xMax%].
      selection: [],
    }
  }

  get rangeMargined () {
    const margin = this.attributes.marginInner
    return [
      [this.attributes.xRange[0] - margin, this.attributes.yRange[1] - margin],
      [this.attributes.xRange[1] + margin, this.attributes.yRange[0] + margin],
    ]
  }

  get selectionRange () {
    this.attributes.selectionScale.range([this.rangeMargined[0][0], this.rangeMargined[1][0]])
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
