/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class StackedBarChartView extends XYChartSubView {
  get type () { return 'stackedBar' }
  get className () { return 'bar-chart' }
  get renderOrder () { return 100 }
  get events () {
    return {
      'mouseover .bar': '_onMouseover',
      'mouseout .bar': '_onMouseout',
    }
  }
  /**
  * Called by the parent in order to calculate maximum data extents for all of this child's axis.
  * Assumes the params.activeAccessorData for this child view is filled by the parent with the relevent yAccessors for this child only.
  * Returns an object with following structure: { y1: [0,10], x: [-10,10] } - axisName: axisDomain
  */
  calculateAxisDomains () {
    const domains = {}
    domains[this.params.plot.x.axis] = this.model.getRangeFor(this.params.plot.x.accessor)
    // The domains calculated here can be overriden in the axis configuration.
    // The overrides are handled by the parent.
    _.each(this.params.activeAccessorData, (accessor) => {
      const domain = this.model.getRangeFor(accessor.accessor)
      if (_.has(domains, this.axisName)) {
        // domains[this.axisName][0] = Math.min( domain[0], domains[this.axisName][0] )
        domains[this.axisName][1] += domain[1]
      } else {
        // domains[this.axisName] = [domain[0], domain[1]]
        domains[this.axisName] = [0, domain[1]]
      }
    })
    this.params.handledAxisNames = _.keys(domains)
    return domains
  }
  /**
   * Called by the parent when all scales have been saved in this child's params.
   * Can be used by the child to perform any additional calculations.
   */
  calculateScales () {}
  /**
  * Override for calculating the Y coordinate of a stacked elem.
  * Used by CrosshairView render data preparation.
  */
  getScreenY (dataElem, yAccessor) {
    const yScale = this.getYScale()
    let stackedY = yScale.domain()[0]
    let found = false
    _.each(this.params.activeAccessorData, (accessor) => {
      if (accessor.accessor === yAccessor) {
        found = true
      }
      if (!found) {
        stackedY += dataElem[accessor.accessor]
      }
    })
    return yScale(stackedY + dataElem[yAccessor])
  }

  render () {
    _.defer(() => { this._render() })
    return this
  }

  _render () {
    super.render()
    const yScale = this.getYScale()

    const svgBarGroups = this.d3
      .selectAll('.bar')
      .data(this._prepareData(), (d) => d.id)
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

  _prepareData () {
    const data = this.getData()
    const yScale = this.getYScale()
    const xScale = this.getXScale()
    const flatData = []
    const xValues = _.map(this.getData(), this.params.plot.x.accessor)
    const xValuesExtent = d3.extent(xValues)
    const xRange = [xScale(xValuesExtent[0]), xScale(xValuesExtent[1])]
    let len = data.length - 1
    if (len === 0) len = 1
    const bandWidth = (0.95 * ((xRange[1] - xRange[0]) / len) - 1)
    const bandWidthHalf = (bandWidth / 2)
    _.each(data, (d) => {
      const x = d[this.params.plot.x.accessor]
      let stackedY = yScale.domain()[0]
      _.each(this.params.activeAccessorData, (accessor) => {
        const key = accessor.accessor
        const obj = {
          id: x + '-' + key,
          className: 'bar bar-' + key,
          x: xScale(x) - bandWidthHalf,
          y: yScale(stackedY + d[key]),
          h: yScale(stackedY) - yScale(stackedY + d[key]),
          w: bandWidth,
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

  _onMouseover (d) {
    if (this.config.get('tooltipEnabled')) {
      const offset = this.$el.offset()
      const tooltipOffset = {
        top: d.y + offset.top,
        left: d.x + offset.left,
      }
      this._eventObject.trigger('showTooltip', tooltipOffset, d.data, d.accessor.tooltip)
    }
    this.d3.select(() => d3.event.currentTarget).classed('active', true)
  }

  _onMouseout (d) {
    if (this.config.get('tooltipEnabled')) {
      this._eventObject.trigger('hideTooltip', d.accessor.tooltip)
    }
    this.d3.select(() => d3.event.currentTarget).classed('active', false)
  }
}

module.exports = StackedBarChartView
