/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import 'd3'
import ContrailChartsView from 'contrail-charts-view'

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
    return this.params.axis[this.params.plot.x.axis].scale
  }

  get yScale () {
    return _.has(this.params.axis[this.axisName], 'scale') ? this.params.axis[this.axisName].scale : d3.scaleLinear()
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

  getScreenX (datum, xAccessor) {
    return this.xScale(datum[xAccessor])
  }

  getScreenY (datum, yAccessor) {
    return this.yScale(datum[yAccessor])
  }

  render () {
    super.render()
    this._onMouseout()
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

    const enabledAccessors = _.filter(this.params.plot.y, a => a.enabled)
    const accessorsByAxis = _.groupBy(enabledAccessors, 'axis')
    _.each(accessorsByAxis, (accessors, axisName) => {
      domains[axisName] = this.model.combineDomains(_.map(accessors, 'accessor'))
      if (domains[axisName][0] === domains[axisName][1]) {
        // TODO get maximum range of all enabled series but not of first only?
        domains[axisName] = this.model.getRangeFor(accessors[0].accessor, true)
      }

      // Override axis domain based on axis config.
      const configDomain = this.config.getDomain(axisName)
      if (!configDomain) return
      if (!_.isNil(configDomain[0])) domains[axisName][0] = configDomain[0]
      if (!_.isNil(configDomain[1])) domains[axisName][1] = configDomain[1]
    })
    return domains
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const tooltipId = d && d.accessor ? d.accessor.tooltip : _.map(this.params.activeAccessorData, a => a.tooltip)
      this._actionman.fire('HideComponent', tooltipId)
    }
    _.each(el ? [el] : document.querySelectorAll(this.selectors.node), el => el.classList.remove('active'))
  }
}
