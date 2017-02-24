/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import * as d3Scale from 'd3-scale'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class PieChartConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // sets the position for shared svg container
      isPrimary: true,

      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      colorScheme: d3Scale.schemeCategory20,
      // default we're keeping colorScale as undefined. during init, we will set it to ordinal scale of colorScheme. If set, this has precedence over scheme.
      colorScale: undefined,

      onClick: (data, el, chart) => {},

      // Boolean to enable/disable default pointer cursor. You may pass in custom cursor.
      onClickCursor: false,
    }
  }

  initialize (p) {
    // User should provide colorScheme instead of colorScale. it can be always overridden. if colorScale is not provided, lets use the colorScheme to create one.
    if (!this.attributes.colorScale && p.colorScheme) this.attributes.colorScale = d3Scale.scaleOrdinal(p.colorScheme)
  }

  get innerRadius () {
    const chartType = this.get('type')
    const innerRadiusCoefficient = chartType === 'pie' ? 0 : 0.75
    return this.get('radius') * innerRadiusCoefficient
  }

  getColor (data, accessor) {
    const configuredColor = super.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor)
  }

  getLabels (dataProvider) {
    const labelFormatter = this.get('serie').getLabel
    return dataProvider.getLabels(labelFormatter)
  }
}
