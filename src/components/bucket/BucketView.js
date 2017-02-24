/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './bucket.scss'
import _ from 'lodash'
import * as d3Array from 'd3-array'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import {hashCode} from '../../plugins/Util'
import Cluster from './Cluster'
import ContrailChartsView from 'contrail-charts-view'

export default class BucketView extends ContrailChartsView {
  get tagName () { return 'g' }

  get zIndex () { return 2 }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.bucket',
    })
  }

  get events () {
    return {
      [`click ${this.selectors.node}`]: '_onClick',
    }
  }

  render (points) {
    super.render()
    const data = this._bucketize(points)

    const buckets = this.d3.selectAll(this.selectors.node)
      .data(data, d => d.id)

    const shape = this.config.get('shape')
    const color = this.config.get('color')
    const scale = this.config.scale
    const groups = buckets.enter()
      .append('g')
      .classed(this.selectorClass('node'), true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
    groups
      .append('text')
      .html(shape)
      .attr('fill', color)
      .style('font-size', d => Math.sqrt(scale(d.area)))

    groups
      .append('text')
      .attr('class', 'label')
      .text(d => d.bucket.length)
    // Update
    buckets
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('transform', d => `translate(${d.x},${d.y})`)

    buckets.exit().remove()
  }

  _bucketize (data) {
    const cluster = new Cluster()
    cluster
      .x(d => d.x)
      .y(d => d.y)
      .data(data)
    const buckets = cluster.buckets()

    _.each(buckets, d => {
      d.id = this._getId(d)
      d.area = this._getSize(d)
    })
    this.config.scale
      .domain(d3Array.extent(buckets, d => d.area))

    return buckets
  }

  _getId (bucket) {
    const summaryId = _.reduce(bucket.bucket, (sum, datum) => {
      sum += datum.id
      return sum
    }, '')
    return hashCode(summaryId)
  }

  _getSize (bucket) {
    return _.reduce(bucket.bucket, (sum, datum) => {
      sum += datum.area
      return sum
    }, 0)
  }

  // Event handlers

  _onMouseover (d, el, event) {
    if (this.config.get('tooltipEnabled')) {
      const [left, top] = d3Selection.mouse(this._container)
      this._actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onClick (d, el) {
    d
  }
}
