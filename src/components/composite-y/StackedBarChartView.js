/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./bar-chart.scss')
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class StackedBarChartView extends XYChartSubView {
  get zIndex () { return 1 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.bar',
    })
  }

  get events () {
    return {
      [`mousemove ${this.selectors.node}`]: '_onMousemove',
      [`mouseout ${this.selectors.node}`]: '_onMouseout',
    }
  }
  /**
   * @override
   */
  get xMarginInner () {
    if (this.model.data.length < 2) return 0
    return this.bandWidth / 2
  }
  // TODO use memoize function
  get bandWidth () {
    if (_.isEmpty(this.model.data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 2 / 100)
    // TODO do not use model.data.length as there can be gaps
    return this.innerWidth / this.model.data.length * paddedPart
  }

  combineDomains () {
    const domains = super.combineDomains()
    const topY = _.reduce(this.params.activeAccessorData, (sum, accessor) => {
      return sum + this.model.getRangeFor(accessor.accessor)[1]
    }, 0)
    if (domains[this.axisName]) domains[this.axisName][1] = topY
    return domains
  }
  /**
  * Override for calculating the Y coordinate of a stacked elem.
  * Used by CrosshairView render data preparation.
  */
  getScreenY (dataElem, yAccessor) {
    let stackedY = 0
    let found = false
    _.each(this.params.activeAccessorData, accessor => {
      if (accessor.accessor === yAccessor) {
        found = true
      }
      if (!found) {
        stackedY += dataElem[accessor.accessor]
      }
    })
    return this.yScale(stackedY + dataElem[yAccessor])
  }

  render () {
    super.render()

    const svgBarGroups = this.d3
      .selectAll(this.selectors.node)
      .data(this._prepareData(), d => d.id)
    svgBarGroups.enter().append('rect')
      .attr('class', d => 'bar')
      .attr('x', d => d.x)
      .attr('y', this.yScale.range()[0])
      .attr('height', 0)
      .attr('width', d => d.w)
      .merge(svgBarGroups).transition().ease(d3.easeLinear).duration(this.params.duration)
      .attr('fill', d => d.color)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('height', d => d.h)
      .attr('width', d => d.w)
    svgBarGroups.exit().remove()
  }

  _prepareData () {
    const data = this.model.data
    const start = this.yScale.domain()[0]
    const flatData = []
    const bandWidthHalf = (this.bandWidth / 2)
    _.each(data, d => {
      const x = d[this.params.plot.x.accessor]
      let stackedY = start
      // y coordinate to stack next bar to
      _.each(this.params.activeAccessorData, accessor => {
        const key = accessor.accessor
        const obj = {
          id: x + '-' + key,
          x: this.xScale(x) - bandWidthHalf,
          y: this.yScale(d[key] - start + stackedY),
          h: this.yScale(start) - this.yScale(d[key]),
          w: this.bandWidth,
          color: this.config.getColor(d, accessor),
          accessor: accessor,
          data: d,
        }
        stackedY += (d[key] - start)
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMousemove (d, el, event) {
    if (this.config.get('tooltipEnabled')) {
      const tooltipOffset = {
        top: event.pageY,
        left: event.pageX,
      }
      this._actionman.fire('ShowComponent', d.accessor.tooltip, tooltipOffset, d.data)
    }
    el.classList.add('active')
  }
}

module.exports = StackedBarChartView
