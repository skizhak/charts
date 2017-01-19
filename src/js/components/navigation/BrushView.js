/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const d3Ease = require('d3-ease')
const ContrailChartsView = require('contrail-charts-view')

class BrushView extends ContrailChartsView {
  get tagName () { return 'g' }
  get className () { return 'brush' }
  get zIndex () { return 9 }
  constructor (options) {
    super(options)
    this._throttledRenderBrush = _.throttle(this.render, 100).bind(this)
    window.addEventListener('resize', this._onWindowResize.bind(this))
  }

  render () {
    super.render()
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    const marginInner = this.params.marginInner
    const brushHandleHeight = 16
    this._brush = d3.brushX()
      .extent([
        [this.params.xRange[0] - marginInner, this.params.yRange[1] - marginInner],
        [this.params.xRange[1] + marginInner, this.params.yRange[0] + marginInner]])
      .handleSize(10)
      .on('brush', () => {
        this._onSelection(d3.event.selection)
      })
      .on('end', () => {
        const dataWindow = d3.event.selection
        if (!dataWindow) {
          this.remove()
          this.render()
        } else {
          this._onSelection(d3.event.selection)
        }
      })
    this.d3.selectAll('.handle--custom')
      .data([{type: 'w'}, {type: 'e'}])
      .enter().append('path')
      .classed('hide', true)
      .classed('handle--custom', true)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(brushHandleHeight / 2)
        .startAngle(0)
        .endAngle((d, i) => { return i ? Math.PI : -Math.PI }))
    this.d3.call(this._brush)
    if (_.isArray(this.params.selection)) {
      const brushGroup = this.d3.transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      const xMin = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[0] / 100) + xScale.range()[0]
      const xMax = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[1] / 100) + xScale.range()[0]
      this._brush.move(brushGroup, [xMin, xMax])
    }
  }

  remove () {
    this.el.innerHTML = ''
    this._brush = null
    this.d3.selectAll('.handle--custom')
      .classed('hide', true)
    // this.config.unset('focusDomain', { silent: true })
    // const newFocusDomain = {}
    // this._focusDataProvider.setRangeAndFilterData(newFocusDomain)
  }

  // Event handlers

  _onSelection (selection) {
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    const brushHandleCenter = (this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner) / 2
    let xMin = xScale.invert(selection[0])
    let xMax = xScale.invert(selection[1])
    if (_.isDate(xMin)) xMin = xMin.getTime()
    if (_.isDate(xMax)) xMax = xMax.getTime()
    const gHandles = this.d3.selectAll('.handle--custom')
    gHandles
      // TODO class should be reapplied
      .classed('hide', false)
      .attr('transform', (d, i) => {
        return `translate(${selection[i]},${brushHandleCenter}) scale(1,2)`
      })
    this.trigger('brush', [xMin, xMax])
  }

  _onWindowResize () {
    this._throttledRenderBrush()
  }
}

module.exports = BrushView
