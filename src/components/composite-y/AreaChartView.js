/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./area-chart.scss')
const _ = require('lodash')
const d3 = require('d3')
const d3Array = require('d3-array')
const XYChartSubView = require('components/composite-y/XYChartSubView')

class AreaChartView extends XYChartSubView {
  get zIndex () { return 2 }
  get events () {
    return {
      'mouseover .area': '_onMouseover',
      'mouseout .area': '_onMouseout',
    }
  }

  combineDomains () {
    const domains = super.combineDomains()

    const stackGroups = _.groupBy(this.params.activeAccessorData, 'stack')
    const totalRangeValues = _.reduce(stackGroups, (totalRangeValues, accessors) => {
      const stackedRange = _.reduce(accessors, (stackedRange, accessor) => {
        const range = this.model.getRangeFor(accessor.accessor)
        // Summarize ranges for stacked layers
        return [stackedRange[0] + range[0], stackedRange[1] + range[1]]
      }, [0, 0])
      // Get min / max extent for non-stacked layers
      return totalRangeValues.concat(stackedRange)
    }, [0, 0])
    const totalRange = d3Array.extent(totalRangeValues)
    if (domains[this.axisName]) domains[this.axisName] = totalRange
    return domains
  }
  /**
   * Render all areas in a single stack unless specific stack names specified
   */
  render () {
    super.render()
    const data = this.model.data
    const area = d3.area()
      .x(d => this.xScale(d.data[this.params.plot.x.accessor]))
      .y0(d => this.yScale(d[1]))
      .y1(d => this.yScale(d[0]))
      .curve(this.config.get('curve'))

    const stackGroups = _.groupBy(this.params.activeAccessorData, 'stack')
    _.each(stackGroups, (accessorsByStack, stackName) => {
      const stack = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(_.map(accessorsByStack, 'accessor'))

      const areas = this.d3.selectAll(`.area-${stackName}`).data(stack(data))
      areas.exit().remove()
      areas.enter().append('path')
        .attr('class', d => `area area-${d.key} area-${stackName}`)
        .merge(areas)
        .transition().ease(d3.easeLinear).duration(this.params.duration)
        .attr('fill', d => this.config.getColor([], _.find(accessorsByStack, {accessor: d.key})))
        .attr('d', area)
    })

    // Remove areas from non-updated stacks
    const updatedAreaClasses = _.reduce(_.keys(stackGroups), (sum, key) => {
      return sum ? `${sum}, .area-${key}` : `.area-${key}`
    }, '')
    const updatedAreaEls = updatedAreaClasses ? this.el.querySelectorAll(updatedAreaClasses) : []
    const updatedAreas = _.difference(this.el.querySelectorAll('.area'), updatedAreaEls)
    _.each(updatedAreas, area => area.remove())
  }

  getTooltipData (xPos) {
    const data = this.model.data
    const xAccessor = this.params.plot.x.accessor
    const xBisector = d3.bisector(d => {
      return d[xAccessor]
    }).left
    const xVal = this.xScale.invert(xPos)
    const index = xBisector(data, xVal, 1)
    const dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  }

  // Event handlers

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const pos = d3.mouse(el)
      const offset = el.getBoundingClientRect()
      const dataItem = this.getTooltipData(pos[0])
      const tooltipOffset = {
        top: offset.top + pos[1],
        left: offset.left + pos[0] - this.xScale.range()[0],
      }
      this._actionman.fire('ShowComponent', this.params.activeAccessorData[d.index].tooltip, tooltipOffset, dataItem)
    }
    el.classList.add('active')
  }

  _onMouseout (d, el) {
    if (this.config.get('tooltipEnabled')) {
      this._actionman.fire('HideComponent', this.params.activeAccessorData[d.index].tooltip)
    }
    el.classList.remove('active')
  }
}

module.exports = AreaChartView
