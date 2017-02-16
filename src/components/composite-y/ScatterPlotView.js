/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './scatter-plot.scss'
import _ from 'lodash'
import 'd3-transition'
import * as d3Ease from 'd3-ease'
import XYChartSubView from 'components/composite-y/XYChartSubView'

export default class ScatterPlotView extends XYChartSubView {
  get zIndex () { return 1 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.point',
    })
  }

  get events () {
    return {
      [`mouseover ${this.selectors.node}`]: '_onMouseover',
      [`mouseout ${this.selectors.node}`]: '_onMouseout',
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

    let points = this.d3.selectAll(this.selectors.node)
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
      const [left, top] = d3.mouse(this._container)
      this._actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }
}
