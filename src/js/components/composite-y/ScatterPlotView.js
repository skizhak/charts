/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
require('d3-transition')
const d3Shape = require('d3-shape')
const d3Array = require('d3-array')
const d3Ease = require('d3-ease')
const d3Scale = require('d3-scale')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class ScatterPlotView extends XYChartSubView {
  get type () { return 'scatterPlot' }
  get className () { return 'coCharts-scatter-plot' }
  get zIndex () { return 1 }

  get events () {
    return {
      'mouseover .point': '_onMouseover',
      'mouseout .point': '_onMouseout',
    }
  }

  constructor (options) {
    super(options)
    this.shapeScale = d3Scale.scaleOrdinal()
      .domain(['square', 'triangle', 'circle'])
      .range([d3Shape.symbolSquare, d3Shape.symbolTriangle, d3Shape.symbolCircle])
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
      if (accessor.sizeAccessor && accessor.shape && accessor.sizeAxis) {
        if (!domains[accessor.sizeAxis]) {
          domains[accessor.sizeAxis] = []
        }
        domains[accessor.sizeAxis] = domains[accessor.sizeAxis].concat(this.model.getRangeFor(accessor.sizeAccessor))
      }
    })
    _.each(domains, (domain, key) => {
      domains[key] = d3Array.extent(domain)
    })
    this.params.handledAxisNames = _.keys(domains)
    return domains
  }
  /**
   * Called by the parent when all scales have been saved in this child's params.
   * Can be used by the child to perform any additional calculations.
   */
  calculateScales () {}

  render () {
    _.defer(() => { this._render() })
    return this
  }

  _render () {
    super.render()

    let points = this.d3.selectAll('.point')
      .data(this._prepareData(), (d) => d.id)

    points.enter()
      .append('path')
      .attr('class', 'point')
      .attr('d', (d) => {
        return d3Shape.symbol().type(d.shape).size(1)()
      })
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .attr('fill', (d) => d.color)
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('d', (d) => d3Shape.symbol().type(d.shape).size(d.area)())

    // Update
    points
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('transform', (d) => `translate(${d.x},${d.y})`)

    points.exit()
      .transition()
      .ease(d3Ease.easeLinear)
      .duration(this.params.duration)
      .attr('r', 0)
      .remove()
  }
  /**
   * Create a flat data structure
   */
  _prepareData () {
    const data = this.getData()
    const yScale = this.getYScale()
    const xScale = this.params.axis[this.params.plot.x.axis].scale

    const flatData = []
    _.map(data, (d) => {
      const x = d[this.params.plot.x.accessor]
      _.each(this.params.activeAccessorData, (accessor) => {
        const key = accessor.accessor
        const y = d[key]
        const rScale = this.params.axis[accessor.sizeAxis].scale
        const obj = {
          id: x + '-' + key,
          className: 'point point-' + key,
          selectClassName: '.point-' + key,
          x: xScale(x),
          y: yScale(y),
          shape: this.shapeScale(accessor.shape),
          area: 4 * rScale(d[accessor.sizeAccessor]) * rScale(d[accessor.sizeAccessor]),
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
      this.d3.select(() => el)
        .classed('active', true)
      const offset = {
        left: d.x + Math.sqrt(d.area) * 0.71,
        top: d.y - Math.sqrt(d.area) * 0.71,
      }
      this._eventObject.trigger('showTooltip', offset, d.data, d.accessor.tooltip)
    }
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this.d3.select(() => el)
        .classed('active', false)
      this._eventObject.trigger('hideTooltip', d.accessor.tooltip)
    }
  }
}

module.exports = ScatterPlotView
