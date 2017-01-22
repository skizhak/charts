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
    window.addEventListener('resize', _.throttle(this.render.bind(this), 100))
  }

  render () {
    super.render()
    this.resetParams()
    const extent = this.params.extent
    const brushHandleHeight = 16
    this._brush = d3.brushX()
      .extent(extent)
      .handleSize(10)
      .on('brush', () => {
        this._onSelection(d3.event.selection)
      })
      .on('end', () => {
        const selection = d3.event.selection
        if (!selection) {
          this.remove()
          this.render()
        } else {
          this._onSelection(selection)
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
      const xMin = (extent[1][0] - extent[0][0]) * (this.params.selection[0] / 100) + extent[0][0]
      const xMax = (extent[1][0] - extent[0][0]) * (this.params.selection[1] / 100) + extent[0][0]
      this._brush.move(brushGroup, [xMin, xMax])
    }
  }

  remove () {
    this.el.innerHTML = ''
    this._brush = null
    this.d3.selectAll('.handle--custom')
      .classed('hide', true)
  }

  // Event handlers

  _onSelection (selection) {
    if (!selection) return
    const extent = this.params.extent
    const brushHandleCenter = (extent[1][1] - extent[0][1]) / 2
    const gHandles = this.d3.selectAll('.handle--custom')
    gHandles
      // TODO class should be reapplied
      .classed('hide', false)
      .attr('transform', (d, i) => {
        return `translate(${selection[i]},${brushHandleCenter}) scale(1,2)`
      })
    this.trigger('selection', selection)
  }
}

module.exports = BrushView
