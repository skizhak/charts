/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class CompositeYChartConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      isPrimary: true,
      // by default will use common shared container under the parent
      isSharedContainer: true,

      // The chart width. If not provided will be calculated by View.
      chartWidth: undefined,

      // The difference by how much we want to modify the computed width.
      chartWidthDelta: undefined,

      // The chart height. If not provided will be calculated by View.
      chartHeight: undefined,

      colorScale: d3.scaleOrdinal(d3.schemeCategory20),
      // Duration of chart transitions.
      duration: 300,

      xTicks: 10,
      yTicks: 10,

      // Margin between label and chart
      labelMargin: 16,

      // Side margins.
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 40,
      marginRight: 40,
      marginInner: 10,

      curve: d3.curveCatmullRom.alpha(0.5),
      axisPositions: ['left', 'right', 'top', 'bottom'],
      plot: {},
      axis: {},
      // TODO move to the BarChartConfigModel
      // Padding between series in percents of bar width
      barPadding: 15,
    }
  }
  /**
   * @param {String} name of axis
   */
  getScale (name) {
    const axis = this.attributes.axis[name] || {}
    if (_.isFunction(d3[axis.scale])) return d3[axis.scale]()
    if (['bottom', 'top'].includes(this.getPosition(name))) return d3.scaleTime()
    return d3.scaleLinear()
  }

  getPosition (name) {
    const axis = this.attributes.axis[name] || {}
    if (this.attributes.axisPositions.includes(axis.position)) return axis.position
    if (name.startsWith('x')) return 'bottom'
    if (name.startsWith('y')) return 'left'
  }

  getColor (accessor) {
    if (_.has(accessor, 'color')) {
      return accessor.color
    } else {
      return this.attributes.colorScale(accessor.accessor)
    }
  }

  getAccessors () {
    return this.get('plot').y
  }
  /**
   * Override parent
   */
  toggleComponent (type, enable) {
    switch (type) {
      case 'Tooltip':
        if (!this.attributes.crosshairEnabled) this.set('tooltipEnabled', enable, {silent: true})
        break
      case 'Crosshair':
        this.set('tooltipEnabled', !enable, {silent: true})
        this.set('crosshairEnabled', enable, {silent: true})
        break
      default:
        break
    }
  }
}

module.exports = CompositeYChartConfigModel
