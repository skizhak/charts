/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./bar-chart.scss')
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class BarChartView extends XYChartSubView {
  get zIndex () { return 1 }
  get events () {
    return {
      'mouseover .bar': '_onMouseover',
      'mouseout .bar': '_onMouseout',
    }
  }
  /**
   * @override
   */
  get xMarginInner () {
    return this.bandWidth / 2
  }

  get bandWidth () {
    const paddedPart = 1 - (this.config.get('barPadding') / 2 / 100)
    return this.innerWidth / (this.model.data.length || 1) * paddedPart
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
    _.each(this.params.activeAccessorData, accessor => {
      const domain = this.model.getRangeFor(accessor.accessor)
      domains[this.axisName] = domains[this.axisName].concat(domain)
    })
    domains[this.axisName] = d3.extent(domains[this.axisName])
    this.params.handledAxisNames = _.keys(domains)
    return domains
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
      .selectAll('.bar')
      .data(this._prepareData(), d => d.id)
    svgBarGroups.enter().append('rect')
      .attr('class', d => 'bar')
      .attr('x', d => d.x)
      .attr('y', this.yScale.range()[0])
      .attr('height', 0)
      .attr('width', d => d.w)
      .merge(svgBarGroups).transition().ease(d3.easeLinear).duration(this.params.duration)
      .attr('fill', d => d.color)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('height', d => d.h)
      .attr('width', d => d.w)
    svgBarGroups.exit().remove()
  }

  _prepareData () {
    const flatData = []
    const zeroValue = this.yScale.domain()[0]
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
          h: this.yScale(zeroValue) - this.yScale(d[key]),
          w: innerBandWidth,
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
      this._actionman.fire('ShowComponent', d.accessor.tooltip, {left: d.x, top: d.y}, d.data)
    }
    el.classList.add('active')
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._actionman.fire('HideComponent', d.accessor.tooltip)
    }
    el.classList.remove('active')
  }
}

module.exports = BarChartView
