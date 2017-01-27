/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const d3Ease = require('d3-ease')
const ContrailChartsView = require('contrail-charts-view')

class BrushView extends ContrailChartsView {
  get tagName () { return 'g' }
  get className () { return 'brush' }
  get zIndex () { return 9 }
  constructor (options) {
    super(options)
    this._brush = d3.brushX()
    this.listenTo(this.config, 'change', this.render)
  }

  render () {
    super.render()
    this._brush
      .extent(this.config.get('extent'))
      .handleSize(10)
      .on('start brush end', this._onSelection.bind(this))
    this.d3.selectAll('.handle--custom')
      .data([{type: 'w'}, {type: 'e'}])
      .enter().append('path')
      .classed('hide', true)
      .classed('handle--custom', true)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(this.config.handleHeight / 2)
        .startAngle(0)
        .endAngle((d, i) => { return i ? Math.PI : -Math.PI }))
    this.d3.call(this._brush)
    const brushGroup = this.d3.transition().ease(d3Ease.easeLinear).duration(this.config.duration)
    this._brush.move(brushGroup, this.config.selection)
  }

  remove () {
    this.d3.selectAll('.handle--custom')
      .classed('hide', true)
  }

  // Event handlers

  _onSelection () {
    let selection = d3.event.selection
    if (!selection) {
      return this.remove()
    }
    this.config.set('selection', selection, {silent: true})
    this.d3.selectAll('.handle--custom')
      .classed('hide', false)
      .attr('transform', (d, i) => {
        return `translate(${selection[i]},${this.config.handleCenter}) scale(1,2)`
      })
    // selection is removed when clicking outside a brush
    if (selection[0] === selection[1]) {
      const extent = this.config.get('extent')
      selection = [extent[0][0], extent[1][0]]
    }
    this.trigger('selection', selection)
  }
}

module.exports = BrushView
