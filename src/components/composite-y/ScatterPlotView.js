/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './scatter-plot.scss'
import _ from 'lodash'
import * as d3 from 'd3'
import {hashCode} from '../../plugins/Util'
import 'd3-transition'
import Cluster from './cluster'
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
      bucket: '.bucket',
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
    const {points: data, buckets: bucketData} = this._prepareData()

    const buckets = this.d3.selectAll(this.selectors.bucket)
      .data(bucketData, d => d.id)

    buckets.enter()
      .append('circle')
      .classed(this.selectorClass('bucket'), true)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)

    let points = this.d3.selectAll(this.selectors.node)
      .data(data, d => d.id)

    points.enter()
      .append('text')
      .classed('point', true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .merge(points)
      .html(d => d.shape)
      .attr('fill', d => d.overlap ? 'none' : d.color)
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
    const cluster = new Cluster()
    cluster
      .x(d => d.x)
      .y(d => d.y)
      .data(points)
    const buckets = cluster.buckets()

    _.each(buckets, d => {
      d.id = this._getBucketId(d)
      d.r = this._getBucketRadius(d)
    })

    return {points, buckets}
  }

  _getBucketId (bucket) {
    const summaryId = _.reduce(bucket.bucket, (sum, datum) => {
      sum += datum.id
      return sum
    }, '')
    return hashCode(summaryId)
  }

  _getBucketRadius (bucket) {
    let sum = _.reduce(bucket.bucket, (sum, datum) => {
      sum += datum.area
      return sum
    }, 0)
    return Math.sqrt(sum / Math.PI)
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
