/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'plugins/Actionman'

export default class XYChartSubView extends ContrailChartsView {
  constructor (p) {
    super(p)
    // TODO use ConfigModel as a parent
    this._parent = p.parent
  }
  /**
   * follow same naming convention for all charts
   */
  get selectors () {
    return _.extend(super.selectors, {
      active: '.active',
    })
  }

  get tagName () { return 'g' }

  get width () {
    const delta = this.config.get('chartWidthDelta') || 0
    return (this.config.get('chartWidth') || this._container.getBoundingClientRect().width) + delta
  }

  get height () {
    return this.config.get('chartHeight') || Math.round(this.width / 2)
  }

  get xScale () {
    return _.get(this.params.axis, 'x.scale')
  }

  get yScale () {
    return _.has(this.params.axis[this.axisName], 'scale') ? this.params.axis[this.axisName].scale : d3Scale.scaleLinear()
  }

  get axisName () {
    return this.config.get('axisName')
  }

  get innerWidth () {
    const p = this.params
    return this.width - p.marginRight - p.marginLeft - 2 * p.marginInner
  }

  get outerWidth () {
    const x = this.params.plot.x.accessor
    if (!_.isFunction(this.xScale)) return this.innerWidth
    return Math.abs(this.xScale(_.last(this.model.data)[x]) - this.xScale(this.model.data[0][x]))
  }

  get xMarginInner () {
    return 0
  }

  getScreenX (datum, xAccessor) {
    return this.xScale(datum[xAccessor])
  }

  getScreenY (datum, yAccessor) {
    return this.yScale(datum[yAccessor])
  }

  render () {
    super.render()
    this._onMouseout()
    this.d3.attr('clip-path', `url(#${this._parent.clip})`)
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
    this._overrideDomain(xAxisName, domains)

    const enabledAccessors = _.filter(this.params.plot.y, a => a.enabled)
    const accessorsByAxis = _.groupBy(enabledAccessors, 'axis')
    _.each(accessorsByAxis, (accessors, axisName) => {
      domains[axisName] = this.model.combineDomains(_.map(accessors, 'accessor'))
      if (domains[axisName][0] === domains[axisName][1]) {
        // TODO get maximum range of all enabled series but not of first only?
        domains[axisName] = this.model.getRangeFor(accessors[0].accessor, true)
      }
      this._overrideDomain(axisName, domains)
    })
    return domains
  }
  // Override axis domain based on axis config
  _overrideDomain (axisName, domains) {
    const configDomain = this.config.getDomain(axisName)
    if (!configDomain) return
    if (!_.isNil(configDomain[0])) domains[axisName][0] = configDomain[0]
    if (!_.isNil(configDomain[1])) domains[axisName][1] = configDomain[1]
  }

  // Event handlers

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const tooltipId = d && d.accessor ? d.accessor.tooltip : _.map(this.params.activeAccessorData, a => a.tooltip)
      actionman.fire('HideComponent', tooltipId)
    }
    const els = el ? this.d3.select(() => el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
