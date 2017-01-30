/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')

class XYChartSubView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._parent = p.parent
    this.axisName = p.axisName
  }

  get tagName () { return 'g' }

  get width () {
    const delta = this.config.get('chartWidthDelta') || 0
    return (this.config.chartWidth || this._container.getBoundingClientRect().width) + delta
  }

  get height () {
    return this.config.get('chartHeight') || Math.round(this.width / 2)
  }

  get xScale () {
    return this.params.axis[this.params.plot.x.axis].scale
  }

  get yScale () {
    return this.params.axis[this.axisName].scale || d3.scaleLinear()
  }

  get innerWidth () {
    const p = this.params
    return this.width - p.marginRight - p.marginLeft - 2 * p.marginInner
  }

  get xMarginInner () {
    return 0
  }

  getColor (accessor) {
    return accessor.color
  }

  getScreenX (datum, xAccessor) {
    return this.xScale(datum[xAccessor])
  }

  getScreenY (datum, yAccessor) {
    return this.yScale(datum[yAccessor])
  }

  render () {
    super.render()
    this.d3.attr('clip-path', `url(#${this._parent.params.rectClipPathId})`)
  }
}

module.exports = XYChartSubView
