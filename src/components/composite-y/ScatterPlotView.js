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
  * Called by the parent in order to calculate maximum data extents for all of this child's axis.
  * Assumes the params.activeAccessorData for this child view is filled by the parent with the relevant yAccessors for this child only.
  * Returns an object with following structure: { y1: [0,10], x: [-10,10] }
  */
  calculateAxisDomains () {
    const domains = {}
    domains[this.params.plot.x.axis] = this.model.getRangeFor(this.params.plot.x.accessor)
    domains[this.axisName] = []
    // The domains calculated here can be overriden in the axis configuration.
    // The overrides are handled by the parent.
    _.each(this.params.activeAccessorData, accessor => {
      const domain = this.model.getRangeFor(accessor.accessor)
      domains[this.axisName] = domains[this.axisName].concat(domain)
      if (accessor.sizeAccessor && accessor.shape && accessor.sizeAxis) {
        if (!domains[accessor.sizeAxis]) {
          domains[accessor.sizeAxis] = []
        }
        domains[accessor.sizeAxis] = domains[accessor.sizeAxis].concat(this.model.getRangeFor(accessor.sizeAccessor))
      }
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
        const y = d[key]
        const sizeScale = this.params.axis[accessor.sizeAxis].scale
        const obj = {
          id: x + '-' + key,
          x: this.xScale(x),
          y: this.yScale(y),
          shape: accessor.shape,
          area: sizeScale(d[accessor.sizeAccessor]),
          color: this.getColor(accessor),
          accessor: accessor,
          data: d,
        }
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this.d3.select(() => el).classed('active', true)
      const offset = {
        left: d.x,
        top: d.y,
      }
      this._actionman.fire('ShowComponent', d.accessor.tooltip, offset, d.data)
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
