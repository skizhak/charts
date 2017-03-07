/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import * as d3Scale from 'd3-scale'
import * as d3Ease from 'd3-ease'
import * as d3Shape from 'd3-shape'
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class SankeyConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      /*
      isPrimary: true,
      // by default will use common shared container under the parent
      isSharedContainer: true,
      */

      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      labelMargin: 50,

      colorScheme: d3Scale.schemeCategory20,
      // default we're keeping colorScale as undefined. during init, we will set it to ordinal scale of colorScheme. If set, this has precedence over scheme.
      colorScale: undefined,

      // The scale to use that will represent the value of links.
      valueScale: d3Scale.scaleLog(),

      // The width of the nodes in sankey diagram.
      nodeWidth: 15,

      // The padding between nodes in sankey diagram.
      nodePadding: 2,

      // The labels of the levels.
      levels: [],

      // The duration of transitions.
      ease: d3Ease.easeCubic,
      duration: 500,

      valueScale: d3Scale.scaleLog(),
      // valueScale: d3Scale.scaleLinear(),

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

      // curve: d3Shape.curveBundle.beta(0.85)
      // curve: d3Shape.curveBundle.beta(0.95)
      // curve: d3Shape.curveBundle.beta(1)
      curve: d3Shape.curveCatmullRom.alpha(0.5)
      // curve: d3Shape.curveCatmullRom.alpha(0.75)
      // curve: d3Shape.curveCatmullRom.alpha(1)
      // curve: d3Shape.curveLinear
    }
  }

  initialize (p) {
    // User should provide colorScheme instead of colorScale. it can be always overridden. if colorScale is not provided, lets use the colorScheme to create one.
    if (!this.attributes.colorScale && p.colorScheme) this.attributes.colorScale = d3Scale.scaleOrdinal(p.colorScheme)
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
