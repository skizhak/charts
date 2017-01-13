/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsView = require('contrail-charts-view')

class XYChartSubView extends ContrailChartsView {

  constructor (options) {
    super(options)
    this._parent = options.parent
    this.axisName = options.axisName
  }
  /**
  * Returns the unique name of this drawing so it can identify itself for the parent.
  * The drawing's name is of the following format: [axisName]-[chartType] ie. "y1-line".
  */
  getName () {
    return this.axisName + '-' + this.chartType
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

  render () {
    super.render()
    this.d3
      .classed(`g.drawing-${this.getName()}`, true)
      .attr('clip-path', `url(#${this._parent.params.rectClipPathId})`)
  }
}

module.exports = XYChartSubView
