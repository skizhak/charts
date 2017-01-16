/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsView = require('contrail-charts-view')

class XYChartSubView extends ContrailChartsView {
  get tagName () { return 'g' }

  constructor (options) {
    super(options)
    this._parent = options.parent
    this.axisName = options.axisName
  }

  getYScale () {
    return this.params.axis[this.axisName].scale
  }

  getXScale () {
    return this.params.axis[this.params.plot.x.axis].scale
  }

  getColor (accessor) {
    return accessor.color
  }

  getScreenX (dataElem, xAccessor) {
    const xScale = this.getXScale()
    return xScale(dataElem[xAccessor])
  }

  getScreenY (dataElem, yAccessor) {
    const yScale = this.getYScale()
    return yScale(dataElem[yAccessor])
  }

  resetParams () {
    this.params = this.config.initializedComputedParameters()
    this.params.isPrimary = false
  }

  render () {
    super.render()
    this.d3.attr('clip-path', `url(#${this._parent.params.rectClipPathId})`)
  }
}

module.exports = XYChartSubView
