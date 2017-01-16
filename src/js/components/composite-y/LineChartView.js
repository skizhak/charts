/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
require('d3-transition')
const d3Shape = require('d3-shape')
const d3Array = require('d3-array')
const d3Ease = require('d3-ease')
const XYChartSubView = require('components/composite-y/XYChartSubView')

/**
* This is the child view for CompositeYChartView.
*/
class LineChartView extends XYChartSubView {
  get type () { return 'line' }
  get className () { return 'line-chart' }
  get renderOrder () { return 10 }
  get events () {
    return {
      'mouseover .line': '_onMouseover',
      'mouseout .line': '_onMouseout',
    }
  }

  /**
  * Called by the parent in order to calculate maximum data extents for all of this child's axis.
  * Assumes the params.activeAccessorData for this child view is filled by the parent with the relevent yAccessors for this child only.
  * Returns an object with following structure: { y1: [0,10], x: [-10,10] }
  */
  calculateAxisDomains () {
    const domains = {}
    domains[this.params.plot.x.axis] = this.model.getRangeFor(this.params.plot.x.accessor)
    domains[this.axisName] = []
    // The domains calculated here can be overriden in the axis configuration.
    // The overrides are handled by the parent.
    _.each(this.params.activeAccessorData, (accessor) => {
      const domain = this.model.getRangeFor(accessor.accessor)
      domains[this.axisName] = domains[this.axisName].concat(domain)
    })
    domains[this.axisName] = d3Array.extent(domains[this.axisName])
    this.params.handledAxisNames = _.keys(domains)
    return domains
  }
  /**
   * Called by the parent when all scales have been saved in this child's params.
   * Can be used by the child to perform any additional calculations.
   */
  calculateScales () {}

  getTooltipData (data, xPos) {
    const xAccessor = this.params.plot.x.accessor
    const xScale = this.getXScale()
    const xBisector = d3.bisector((d) => d[xAccessor]).left
    const xVal = xScale.invert(xPos)
    const index = xBisector(data, xVal, 1)
    const dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  }

  render () {
    _.defer(() => { this._render() })
    return this
  }

  _render () {
    super.render()

    const data = this.getData()
    // Draw one line (path) for each Y accessor.
    // Collect linePathData - one line per Y accessor.
    const linePathData = []
    const lines = {}
    const yScale = this.getYScale()
    const xScale = this.getXScale()

    const zeroLine = d3Shape.line()
      .x((d) => xScale(d[this.params.plot.x.accessor]))
      .y((d) => yScale.range()[0])
    _.each(this.params.activeAccessorData, (accessor) => {
      const key = accessor.accessor
      lines[key] = d3Shape.line()
        .x((d) => xScale(d[this.params.plot.x.accessor]))
        .y((d) => yScale(d[key]))
        .curve(this.config.get('curve'))
      linePathData.push({ key: key, accessor: accessor, data: data })
    })
    const svgLines = this.d3.selectAll('.line')
      .data(linePathData, (d) => d.key)
    svgLines.enter().append('path')
      .attr('class', (d) => 'line line-' + d.key)
      .attr('d', (d) => zeroLine(data))
      .merge(svgLines)
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('stroke', (d) => this.getColor(d.accessor))
      .attr('d', (d) => lines[d.key](data))
    svgLines.exit().remove()
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const pos = d3.mouse(el)
      const offset = this.$el.offset()
      const dataItem = this.getTooltipData(d.data, pos[0])
      const tooltipOffset = {
        left: offset.left + pos[0] - this.getXScale().range()[0],
        top: offset.top + pos[1],
      }

      this._eventObject.trigger('showTooltip', tooltipOffset, dataItem, d.accessor.tooltip)
    }
    this.d3.select(() => el).classed('active', true)
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._eventObject.trigger('hideTooltip', d.accessor.tooltip)
    }
    this.d3.select(() => el)
      .classed('active', false)
  }
}

module.exports = LineChartView
