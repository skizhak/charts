/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
*/
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class CompositeYChartConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
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

      // General margin used for computing the side margins.
      margin: 30,

      // Side margins. Will be computed if undefined.
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
      marginInner: 0,

      curve: d3.curveCatmullRom.alpha(0.5)
    }
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
   * Enable / disable event triggering with data preperation for specified component
   * @param {String} type Component type
   * @param {Boolean} enable Change state of this component
   */
  toggleComponent (type, enable) {
    switch (type) {
      case 'tooltip':
        if (!this.attributes.crosshairEnabled) this.set('tooltipEnabled', enable)
        break
      case 'crosshair':
        this.set('tooltipEnabled', !enable)
        this.set('crosshairEnabled', enable)
        break
      default:
        break
    }
  }
}

module.exports = CompositeYChartConfigModel
