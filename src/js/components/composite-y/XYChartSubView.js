/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')

class XYChartSubView extends ContrailChartsView {
  get tagName () { return 'g' }

  constructor (p) {
    super(p)
    this._parent = p.parent
    this.axisName = p.axisName
  }

  get yScale () {
    return this.params.axis[this.axisName].scale || d3.scaleLinear()
  }

  get xScale () {
    return this.params.axis[this.params.plot.x.axis].scale
  }

  getColor (accessor) {
    return accessor.color
  }

  getScreenX (dataElem, xAccessor) {
    return this.xScale(dataElem[xAccessor])
  }

  getScreenY (dataElem, yAccessor) {
    return this.yScale(dataElem[yAccessor])
  }

  render () {
    super.render()
    this.d3.attr('clip-path', `url(#${this._parent.params.rectClipPathId})`)
  }
}

module.exports = XYChartSubView
