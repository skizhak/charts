/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './scatter-plot.scss'
import _ from 'lodash'
import 'd3-transition'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import XYChartSubView from 'components/composite-y/XYChartSubView'
import BucketConfigModel from 'components/bucket/BucketConfigModel'
import BucketView from 'components/bucket/BucketView'

export default class ScatterPlotView extends XYChartSubView {
  constructor (p) {
    super(p)
    if (this.config.get('bucket')) {
      this._bucketConfig = new BucketConfigModel(this.config.get('bucket'))
      this._bucketConfig.set('duration', this.config.get('duration'))
      this._bucketView = new BucketView({
        config: this._bucketConfig,
        actionman: this._actionman,
      })
    }
  }

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
    const data = this._prepareData()
    if (this._bucketView) {
      this._bucketView.container = this._container
      this._bucketView.render(data)
    }

    let points = this.d3.selectAll(this.selectors.node)
      .data(data, d => d.id)

    points.enter()
      .append('text')
      .classed('point', true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .merge(points)
      .html(d => d.shape)
      // overlap attribute is set in Bucket View
      .attr('fill', d => d.overlap ? 'none' : d.color)
      .style('font-size', d => Math.sqrt(d.area))

    // Update
    points
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('transform', d => `translate(${d.x},${d.y})`)

    points.exit().remove()
  }
  /**
   * Create a flat data structure
   */
  _prepareData () {
    const points = []
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
            halfWidth: Math.sqrt(sizeScale(d[accessor.sizeAccessor])) / 2,
            halfHeight: Math.sqrt(sizeScale(d[accessor.sizeAccessor])) / 2,
          }
          points.push(obj)
        }
      })
    })
    return points
  }

  // Event handlers

  _onMouseover (d, el, event) {
    if (this.config.get('tooltipEnabled')) {
      const [left, top] = d3Selection.mouse(this._container)
      this._actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }
}
