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

  getTooltipData (data, xPos) {
    const xAccessor = this.params.plot.x.accessor
    const xBisector = d3.bisector(d => {
      return d[xAccessor]
    }).left
    const xVal = this.xScale.invert(xPos)
    const index = xBisector(data, xVal, 1)
    const dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  }

  render () {
    super.render()

    const data = this.model.data
    const linePathData = []
    const lines = {}
    const zeroLine = d3.line()
      .x(d => this.xScale(d[this.params.plot.x.accessor]))
      .y(d => this.yScale.range()[0])

    // Prepare data
    _.each(this.params.activeAccessorData, accessor => {
      const key = accessor.accessor
      lines[key] = d3.line()
        .x(d => this.xScale(d[this.params.plot.x.accessor]))
        .y(d => this.yScale(d[key]))
        .curve(this.config.get('curve'))
      if (!_.isEmpty(data)) linePathData.push({ key, accessor, data })
    })

    const x0 = this.xScale.range()[0]
    const x1 = this.xScale.range()[1]
    const y0 = this.yScale.range()[0]
    const y1 = y0
    const svgLines = this.d3.selectAll('.area').data(linePathData, d => d.key)
    svgLines.exit().remove()
    svgLines.enter().append('path')
      .attr('class', d => 'area area-' + d.key)
      .attr('d', d => zeroLine(data))
      .merge(svgLines)
      .transition().ease(d3.easeLinear).duration(this.params.duration)
      .attr('fill', d => this.getColor(d.accessor))
      .attr('d', d => {
        const line = 'L' + lines[d.key](data).substr(1)
        return 'M' + x0 + ',' + y0 + line + 'L' + x1 + ',' + y1 + 'Z'
      })
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const pos = d3.mouse(el)
      const offset = el.getBoundingClientRect()
      const dataItem = this.getTooltipData(d.data, pos[0])
      const tooltipOffset = {
        top: offset.top + pos[1],
        left: offset.left + pos[0] - this.xScale.range()[0],
      }
      this._actionman.fire('ShowComponent', d.accessor.tooltip, tooltipOffset, dataItem)
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

module.exports = AreaChartView
