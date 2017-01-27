/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const XYChartSubView = require('components/composite-y/XYChartSubView')

/**
* This is the child view for CompositeYChartView.
*/
class AreaChartView extends XYChartSubView {
  get className () { return 'area-chart' }
  get zIndex () { return 50 }
  get events () {
    return {
      'mouseover .area': '_onMouseover',
      'mouseout .area': '_onMouseout',
    }
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
    })
    domains[this.axisName] = d3.extent(domains[this.axisName])
    this.params.handledAxisNames = _.keys(domains)
    return domains
  }
  /**
   * Called by the parent when all scales have been saved in this child's params.
   * Can be used by the child to perform any additional calculations.
   */
  calculateScales () {}
  /**
   * Called by the parent to allow the child to add some initialization code into the provided entering selection.
   */
  renderSVG (enteringSelection) {
    enteringSelection.append('g').attr('class', 'lines')
  }

  getTooltipData (data, xPos) {
    const xAccessor = this.params.plot.x.accessor
    const xBisector = d3.bisector((d) => {
      return d[xAccessor]
    }).left
    const xVal = this.xScale.invert(xPos)
    // if( _.isDate( xVal ) ) {
    //    xVal = xVal.getTime()
    // }
    const index = xBisector(data, xVal, 1)
    const dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  }

  render () {
    super.render()

    const data = this.model.data
    const linePathData = []
    const lines = {}
    const zeroLine = d3.line()
      .x((d) => this.xScale(d[this.params.plot.x.accessor]))
      .y((d) => this.yScale.range()[0])
    _.each(this.params.activeAccessorData, (accessor) => {
      const key = accessor.accessor
      lines[key] = d3.line()
        .x((d) => this.xScale(d[this.params.plot.x.accessor]))
        .y((d) => this.yScale(d[key]))
        .curve(this.config.get('curve'))
      linePathData.push({ key: key, accessor: accessor, data: data })
    })
    const x0 = this.xScale.range()[0]
    const x1 = this.xScale.range()[1]
    const y0 = this.yScale.range()[0]
    const y1 = y0
    const svgLines = this.d3.selectAll('.area').data(linePathData, (d) => d.key)
    svgLines.enter().append('path')
      .attr('class', (d) => 'area area-' + d.key)
      .attr('d', (d) => zeroLine(data))
      .merge(svgLines)
      .transition().ease(d3.easeLinear).duration(this.params.duration)
      .attr('fill', (d) => this.getColor(d.accessor))
      .attr('d', (d) => {
        const line = 'L' + lines[d.key](data).substr(1)
        return 'M' + x0 + ',' + y0 + line + 'L' + x1 + ',' + y1 + 'Z'
      })
    svgLines.exit().remove()
  }

  _onMouseover (d, el) {
    if (this.config.get('tooltipEnabled')) {
      const pos = d3.mouse(el)
      const offset = this.$el.offset()
      const dataItem = this.getTooltipData(d.data, pos[0])
      const tooltipOffset = {
        top: offset.top + pos[1],
        left: offset.left + pos[0] - this.xScale.range()[0],
      }
      this._actionman.fire('ShowComponent', d.accessor.tooltip, tooltipOffset, dataItem)
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

module.exports = AreaChartView
