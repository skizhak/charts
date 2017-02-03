/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')

class XYChartSubView extends ContrailChartsView {
  constructor (p) {
    super(p)
    // TODO use ConfigModel as a parent
    this._parent = p.parent
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

  get axisName () {
    return this.config.get('axisName')
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
  /**
   * Combine series domains (extents) by axis
   */
  combineDomains () {
    const domains = {}
    const xAxisName = this.params.plot.x.axis
    const xAccessor = this.params.plot.x.accessor
    let getFullRange = false
    if (this.model.data.length < 2) getFullRange = true
    domains[xAxisName] = this.model.getRangeFor(xAccessor, getFullRange)

    const seriesByAxis = _.groupBy(this.params.plot.y, 'axis')
    _.each(seriesByAxis, (accessors, axisName) => {
      const enabledSeries = _.map(_.filter(accessors, a => a.enabled), 'accessor')
      domains[axisName] = this.model.combineDomains(enabledSeries)
      if (domains[axisName][0] === domains[axisName][1]) {
        // TODO get maximum range of all enabled series but not of first only?
        domains[axisName] = this.model.getRangeFor(enabledSeries[0], true)
      }

      // Override axis domain based on axis config.
      const configDomain = this.config.getDomain(axisName)
      if (!configDomain) return
      if (!_.isNil(configDomain[0])) domains[axisName][0] = configDomain[0]
      if (!_.isNil(configDomain[1])) domains[axisName][1] = configDomain[1]
    })
    return domains
  }
}

module.exports = XYChartSubView
