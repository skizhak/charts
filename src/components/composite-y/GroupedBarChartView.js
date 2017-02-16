/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './bar-chart.scss'
import _ from 'lodash'
import 'd3'
import * as d3Ease from 'd3-ease'
import XYChartSubView from 'components/composite-y/XYChartSubView'

export default class BarChartView extends XYChartSubView {
  get zIndex () { return 1 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.bar',
    })
  }

  get events () {
    return {
      [`mousemove ${this.selectors.node}`]: '_onMousemove',
      [`mouseout ${this.selectors.node}`]: '_onMouseout',
    }
  }
  /**
   * @override
   */
  get xMarginInner () {
    if (this.model.data.length < 2) return 0
    return this.bandWidth / 2
  }

  get bandWidth () {
    if (_.isEmpty(this.model.data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 2 / 100)
    // TODO do not use model.data.length as there can be gaps
    return this.innerWidth / this.model.data.length * paddedPart
  }

  getScreenX (datum, xAccessor, yAccessor) {
    let delta = 0
    _.each(this.params.activeAccessorData, (accessor, j) => {
      if (accessor.accessor === yAccessor) {
        const innerBandScale = this.params.axis[this.params.plot.x.axis].innerBandScale
        delta = innerBandScale(j) + innerBandScale.bandwidth() / 2
      }
    })
    return this.xScale(datum[xAccessor]) + delta
  }

  getScreenY (datum, yAccessor) {
    return this.yScale(datum[yAccessor])
  }

  render () {
    super.render()

    // Create a flat data structure
    const numOfAccessors = _.keys(this.params.activeAccessorData).length
    const bandWidthHalf = this.bandWidth / 2
    const innerBandScale = d3.scaleBand()
      .domain(d3.range(numOfAccessors))
      .range([-bandWidthHalf, bandWidthHalf])
      .paddingInner(0.05)
      .paddingOuter(0.05)
    this.params.axis[this.params.plot.x.axis].innerBandScale = innerBandScale
    // Render the flat data structure
    const svgBarGroups = this.d3
      .selectAll(this.selectors.node)
      .data(this._prepareData(), d => d.id)
    svgBarGroups.enter().append('rect')
      .attr('class', d => 'bar')
      .attr('x', d => d.x)
      .attr('y', this.yScale.range()[0])
      .attr('height', 0)
      .attr('width', d => d.w)
      .merge(svgBarGroups).transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('fill', d => d.color)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('height', d => d.h)
      .attr('width', d => d.w)
    svgBarGroups.exit().remove()
  }

  _prepareData () {
    const flatData = []
    const start = this.yScale.domain()[0]
    const innerBandScale = this.params.axis[this.params.plot.x.axis].innerBandScale
    const innerBandWidth = innerBandScale.bandwidth()
    _.each(this.model.data, d => {
      const x = d[this.params.plot.x.accessor]
      _.each(this.params.activeAccessorData, (accessor, j) => {
        const key = accessor.accessor
        const obj = {
          id: x + '-' + key,
          x: this.xScale(x) + innerBandScale(j),
          y: this.yScale(d[key]),
          h: this.yScale(start) - this.yScale(d[key]),
          w: innerBandWidth,
          color: this.config.getColor(d, accessor),
          accessor: accessor,
          data: d,
        }
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMousemove (d, el, event) {
    if (this.config.get('tooltipEnabled')) {
      const [left, top] = d3.mouse(this._container)
      this._actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }
}
