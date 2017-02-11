/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./scatter-plot.scss')
const _ = require('lodash')
require('d3-transition')
const d3Ease = require('d3-ease')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class ScatterPlotView extends XYChartSubView {
  get zIndex () { return 1 }

  get events () {
    return {
      'mouseover .point': '_onMouseover',
      'mouseout .point': '_onMouseout',
    }
  }
  /**
   * @return {Object} like:  y1: [0,10], x: [-10,10]
   */
  combineDomains () {
    const domains = super.combineDomains()
    const accessorsBySizeAxis = _.groupBy(this.params.activeAccessorData, 'sizeAxis')
    _.each(accessorsBySizeAxis, (accessors, axis) => {
      const validAccessors = _.filter(accessors, a => a.sizeAccessor && a.shape)
      const validAccessorNames = _.map(validAccessors, 'sizeAccessor')

      domains[axis] = this.model.combineDomains(validAccessorNames)
    })
    return domains
  }

  render () {
    super.render()

    let points = this.d3.selectAll('.point')
      .data(this._prepareData(), d => d.id)

    points.enter()
      .append('text')
      .classed('point', true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .merge(points)
      .html(d => d.shape)
      .attr('fill', d => d.color)
      .style('font-size', d => Math.sqrt(d.area))

    // Update
    points
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('transform', d => `translate(${d.x},${d.y})`)

    points.exit().remove()
  }
  /**
   * Create a flat data structure
   */
  _prepareData () {
    const flatData = []
    _.map(this.model.data, d => {
      const x = d[this.params.plot.x.accessor]
      _.each(this.params.activeAccessorData, accessor => {
        const key = accessor.accessor
        if (_.has(d, key)) { // key may not exist in all the data set.
          const y = d[key]
          const sizeScale = this.params.axis[accessor.sizeAxis].scale
          const obj = {
            id: x + '-' + key,
            x: this.xScale(x),
            y: this.yScale(y),
            shape: accessor.shape,
            area: sizeScale(d[accessor.sizeAccessor]),
            color: this.config.getColor(d, accessor),
            accessor: accessor,
            data: d,
          }
          flatData.push(obj)
        }
      })
    })
    return flatData
  }

  // Event handlers

  _onMouseover (d, el, event) {
    if (this.config.get('tooltipEnabled')) {
      const parentChart = $(el).parents('.cc-chart')
      const tooltipPosition = {
        left: event.clientX - $(parentChart).offset().left + $(window).scrollLeft(),
        top: event.clientY - $(parentChart).offset().top + $(window).scrollTop()
      }

      this.d3.select(() => el).classed('active', true)
      this._actionman.fire('ShowComponent', d.accessor.tooltip, tooltipPosition, d.data)
    }
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this.d3.select(() => el)
        .classed('active', false)
      this._actionman.fire('HideComponent', d.accessor.tooltip)
    }
  }
}

module.exports = ScatterPlotView
