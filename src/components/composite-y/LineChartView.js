/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

require('./line-chart.scss')
const _ = require('lodash')
const d3 = require('d3')
const d3InterpolatePath = require('d3-interpolate-path').interpolatePath
require('d3-transition')
const d3Shape = require('d3-shape')
const d3Ease = require('d3-ease')
const d3Scale = require('d3-scale')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class LineChartView extends XYChartSubView {
  get zIndex () { return 2 }
  get events () {
    return {
      'mouseover .line': '_onMouseover',
      'mouseout .line': '_onMouseout',
    }
  }

  getTooltipData (data, xPos) {
    const xAccessor = this.params.plot.x.accessor
    const xBisector = d3.bisector((d) => d[xAccessor]).left
    const xVal = this.xScale.invert(xPos)
    const index = xBisector(data, xVal, 1)
    const dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  }
  /**
   * Draw one line (path) per each Y accessor.
   */
  render () {
    super.render()
    const data = this.model.data

    // Collect linePathData - one line per Y accessor.
    const linePathData = []
    this._lines = {}

    _.each(this.params.activeAccessorData, accessor => {
      const key = accessor.accessor
      this._lines[key] = d3Shape.line()
        .x(d => this.xScale(d[this.params.plot.x.accessor]))
        .y(d => this.yScale(d[key]))
        .curve(this.config.get('curve'))
      linePathData.push({ key: key, accessor: accessor, data: data })
    })
    const svgLines = this.d3.selectAll('.line')
      .data(linePathData, d => d.key)

    svgLines.enter().append('path')
      .attr('class', d => 'line line-' + d.key)
      .attr('d', d => this._lines[d.key](d.data[0]))
      .transition().ease(d3Ease.linear).duration(this.params.duration)
      .attrTween('d', this._interpolate.bind(this))
      .attr('stroke', d => this.getColor(d.accessor))

    svgLines
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attrTween('d', (d, i, els) => {
        const previous = els[i].getAttribute('d')
        const current = this._lines[d.key](d.data)
        return d3InterpolatePath(previous, current)
      })
      .attr('stroke', d => this.getColor(d.accessor))
    svgLines.exit().remove()
  }
  /**
   * Draw line along the path
   */
  _interpolate (d) {
    const interpolate = d3Scale.scaleQuantile()
      .domain([0, 1])
      .range(d3.range(1, d.data.length + 1))

    return (t) => {
      const interpolatedLine = d.data.slice(0, interpolate(t))
      return this._lines[d.key](interpolatedLine)
    }
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const pos = d3.mouse(el)
      const offset = el.getBoundingClientRect()
      const dataItem = this.getTooltipData(d.data, pos[0])
      const tooltipOffset = {
        left: offset.left + pos[0] - this.xScale.range()[0],
        top: offset.top + pos[1],
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

module.exports = LineChartView
