/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class BarChartView extends XYChartSubView {
  get type () { return 'bar' }
  get className () { return 'bar-chart' }
  get zIndex () { return 1 }
  get events () {
    return {
      'mouseover .bar': '_onMouseover',
      'mouseout .bar': '_onMouseout',
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
    domains[this.axisName] = d3.extent(domains[this.axisName])
    this.params.handledAxisNames = _.keys(domains)
    return domains
  }
  /**
   * Called by the parent when all scales have been saved in this child's params.
   * Can be used by the child to perform any additional calculations.
   */
  calculateScales () {}

  getScreenX (dataElem, xAccessor, yAccessor) {
    const xScale = this.getXScale()
    let delta = 0
    _.each(this.params.activeAccessorData, (accessor, j) => {
      if (accessor.accessor === yAccessor) {
        const innerBandScale = this.params.axis[this.params.plot.x.axis].innerBandScale
        delta = innerBandScale(j) + innerBandScale.bandwidth() / 2
      }
    })
    return xScale(dataElem[xAccessor]) + delta
  }

  getScreenY (dataElem, yAccessor) {
    const yScale = this.getYScale()
    const zeroValue = yScale.domain()[0]
    return yScale(zeroValue + dataElem[yAccessor])
  }

  render () {
    _.defer(() => { this._render() })
    return this
  }

  _render () {
    const data = this.getData()
    const yScale = this.getYScale()
    const xScale = this.getXScale()

    // Create a flat data structure
    const flatData = []
    const numOfAccessors = _.keys(this.params.activeAccessorData).length
    const xValues = _.map(this.getData(), this.params.plot.x.accessor)
    const xValuesExtent = d3.extent(xValues)
    const xRange = [xScale(xValuesExtent[0]), xScale(xValuesExtent[1])]
    let len = data.length - 1
    if (len === 0) {
      len = 1
    }
    const bandWidth = (0.95 * ((xRange[1] - xRange[0]) / len) - 1)
    const bandWidthHalf = (bandWidth / 2)
    const innerBandScale = d3.scaleBand()
      .domain(d3.range(numOfAccessors))
      .range([-bandWidthHalf, bandWidthHalf])
      .paddingInner(0.05)
      .paddingOuter(0.05)
    const innerBandWidth = innerBandScale.bandwidth()
    const zeroValue = yScale.domain()[0]
    this.params.axis[this.params.plot.x.axis].innerBandScale = innerBandScale
    _.each(data, (d) => {
      const x = d[this.params.plot.x.accessor]
      _.each(this.params.activeAccessorData, (accessor, j) => {
        const key = accessor.accessor
        const y = zeroValue + d[key]
        const obj = {
          id: x + '-' + key,
          className: 'bar bar-' + key,
          x: xScale(x) + innerBandScale(j),
          y: yScale(y),
          h: yScale(zeroValue) - yScale(y),
          w: innerBandWidth,
          color: this.getColor(accessor),
          accessor: accessor,
          data: d
        }
        flatData.push(obj)
      })
    })
    // Render the flat data structure
    const svgBarGroups = this.d3
      .selectAll('.bar')
      .data(flatData, (d) => d.id)
    svgBarGroups.enter().append('rect')
      .attr('class', (d) => d.className)
      .attr('x', (d) => d.x)
      .attr('y', yScale.range()[0])
      .attr('height', 0)
      .attr('width', (d) => d.w)
      .merge(svgBarGroups).transition().ease(d3.easeLinear).duration(this.params.duration)
      .attr('fill', (d) => d.color)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('height', (d) => d.h)
      .attr('width', (d) => d.w)
    svgBarGroups.exit().remove()
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._eventObject.trigger('showTooltip', {left: d.x, top: d.y}, d.data, d.accessor.tooltip)
    }
    d3.select(() => el).classed('active', true)
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._eventObject.trigger('hideTooltip', d.accessor.tooltip)
    }
    d3.select(() => el).classed('active', false)
  }
}

module.exports = BarChartView
