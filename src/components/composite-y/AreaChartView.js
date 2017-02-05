/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./area-chart.scss')
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class AreaChartView extends XYChartSubView {
  get zIndex () { return 2 }
  get events () {
    return {
      'mouseover .area': '_onMouseover',
      'mouseout .area': '_onMouseout',
    }
  }

  combineDomains () {
    const domains = super.combineDomains()
    const topY = _.reduce(this.params.activeAccessorData, (sum, accessor) => {
      return sum + this.model.getRangeFor(accessor.accessor)[1]
    }, 0)
    if (domains[this.axisName]) domains[this.axisName][1] = topY
    return domains
  }

  render () {
    super.render()

    const data = this.model.data
    const stack = d3.stack()

    const area = d3.area()
      .x(d => this.xScale(d.data[this.params.plot.x.accessor]))
      .y0(d => this.yScale(d[0]))
      .y1(d => this.yScale(d[1]))
      .curve(this.config.get('curve'))

    const keys = _.map(this.params.activeAccessorData, 'accessor')
    stack.keys(keys)
    const areas = this.d3.selectAll('.area').data(stack(data))
    areas.exit().remove()
    areas.enter().append('path')
      .attr('class', d => 'area area-' + d.key)
      .merge(areas)
      .transition().ease(d3.easeLinear).duration(this.params.duration)
      .attr('fill', d => this.params.activeAccessorData[d.index].color)
      .attr('d', area)
  }

  getTooltipData (xPos) {
    const data = this.model.data
    const xAccessor = this.params.plot.x.accessor
    const xBisector = d3.bisector(d => {
      return d[xAccessor]
    }).left
    const xVal = this.xScale.invert(xPos)
    const index = xBisector(data, xVal, 1)
    const dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const pos = d3.mouse(el)
      const offset = el.getBoundingClientRect()
      const dataItem = this.getTooltipData(pos[0])
      const tooltipOffset = {
        top: offset.top + pos[1],
        left: offset.left + pos[0] - this.xScale.range()[0],
      }
      this._actionman.fire('ShowComponent', this.params.activeAccessorData[d.index].tooltip, tooltipOffset, dataItem)
    }
    el.classList.add('active')
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._actionman.fire('HideComponent', this.params.activeAccessorData[d.index].tooltip)
    }
    el.classList.remove('active')
  }
}

module.exports = AreaChartView
