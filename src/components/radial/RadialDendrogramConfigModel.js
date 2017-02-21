/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import 'd3'
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class RadialDendrogramConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      colorScale: d3.scaleOrdinal(d3.schemeCategory20),

      // The labels of the levels.
      levels: [],

      // The duration of transitions.
      ease: d3.easeCubic,
      duration: 500,

      valueScale: d3.scaleLog(),
      // valueScale: d3.scaleLinear(),

      // The separation in degrees between nodes with different parents
      parentSeparation: 1,
      parentSeparationThreshold: 0,

      // Arc width
      arcWidth: 10,

      // Show arc labels
      showArcLabels: true,

      // Estimated average letter width
      arcLabelLetterWidth: 5,

      // The X offset (in pixels) of the arc label counted from the beggining of the arc.
      arcLabelXOffset: 2,

      // The Y offset (in pixels) of the arc label counted from the outer edge of the arc (positive values offset the label into the center of the circle).
      arcLabelYOffset: 18,

      // Initial drill down level
      drillDownLevel: 1,

      // curve: d3.curveBundle.beta(0.85)
      // curve: d3.curveBundle.beta(0.95)
      // curve: d3.curveBundle.beta(1)
      curve: d3.curveCatmullRom.alpha(0.5)
      // curve: d3.curveCatmullRom.alpha(0.75)
      // curve: d3.curveCatmullRom.alpha(1)
      // curve: d3.curveLinear
    }
  }

  getColor (data, accessor) {
    return accessor.color || this.attributes.colorScale(accessor.level)
  }

  getAccessors () {
    return _.map(this.attributes.levels, (level) => {
      return {
        accessor: level.level,
        level: level.level,
        label: level.label,
        color: level.color,
        enabled: level.level < this.attributes.drillDownLevel
      }
    })
  }
}
