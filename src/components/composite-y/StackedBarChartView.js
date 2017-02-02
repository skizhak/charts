/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./bar-chart.scss')
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class StackedBarChartView extends XYChartSubView {
  get zIndex () { return 1 }
  get events () {
    return {
      'mouseover .bar': '_onMouseover',
      'mouseout .bar': '_onMouseout',
    }
  }
  /**
   * @override
   */
  get xMarginInner () {
    return this.bandWidth / 2
  }
  // TODO use memoize function
  get bandWidth () {
    return 0.95 * (this.innerWidth / (this.model.data.length || 1))
  }
  /**
  * Called by the parent in order to calculate maximum data extents for all of this child's axis.
  * Assumes the params.activeAccessorData for this child view is filled by the parent with the relevent yAccessors for this child only.
  * Returns an object with following structure: { y1: [0,10], x: [-10,10] } - axisName: axisDomain
  */
  calculateAxisDomains () {
    const domains = {}
    domains[this.params.plot.x.axis] = this.model.getRangeFor(this._parent.params.plot.x.accessor)
    // The domains calculated here can be overriden in the axis configuration.
    // The overrides are handled by the parent.
    _.each(this.params.activeAccessorData, accessor => {
      const domain = this.model.getRangeFor(accessor.accessor)
      if (_.has(domains, this.axisName)) {
        domains[this.axisName][1] += domain[1]
      } else {
        domains[this.axisName] = [0, domain[1]]
      }
    })
    this.params.handledAxisNames = _.keys(domains)
    return domains
  }
  /**
  * Override for calculating the Y coordinate of a stacked elem.
  * Used by CrosshairView render data preparation.
  */
  getScreenY (dataElem, yAccessor) {
    let stackedY = this.yScale.domain()[0]
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
      .selectAll('.bar')
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
    const flatData = []
    const bandWidthHalf = (this.bandWidth / 2)
    _.each(data, d => {
      const x = d[this.params.plot.x.accessor]
      let stackedY = this.yScale.domain()[0]
      _.each(this.params.activeAccessorData, accessor => {
        const key = accessor.accessor
        const obj = {
          id: x + '-' + key,
          x: this.xScale(x) - bandWidthHalf,
          y: this.yScale(stackedY + d[key]),
          h: this.yScale(stackedY) - this.yScale(stackedY + d[key]),
          w: this.bandWidth,
          color: this.getColor(accessor),
          accessor: accessor,
          data: d,
        }
        stackedY += d[key]
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const offset = this.$el.offset()
      const tooltipOffset = {
        top: d.y + offset.top,
        left: d.x + offset.left,
      }
      this._actionman.fire('ShowComponent', d.accessor.tooltip, tooltipOffset, d.data)
    }
    el.classList.add('active')
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._actionman.fire('HideComponent', d.accessor.tooltip)
    }
    el.classList.remove('active')
  }
}

module.exports = StackedBarChartView
