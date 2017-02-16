/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import 'd3'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class RadialDendrogramConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      valueScale: d3.scaleLog(),
      //valueScale: d3.scaleLinear(),

      // The separation in degrees between nodes with different parents
      parentSeparation: 1,
      parentSeparationThreshold: 0,

      //curve: d3.curveBundle.beta(0.85)
      //curve: d3.curveBundle.beta(0.95)
      //curve: d3.curveBundle.beta(1)
      curve: d3.curveCatmullRom.alpha(0.5)
      //curve: d3.curveCatmullRom.alpha(0.75)
      //curve: d3.curveCatmullRom.alpha(1)
      //curve: d3.curveLinear
    }
  }
}
