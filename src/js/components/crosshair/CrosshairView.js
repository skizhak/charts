/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')

class CrosshairView extends ContrailChartsView {
  get tagName () { return 'g' }
  get className () { return 'coCharts-crosshair-view' }
  get zIndex () { return 9 }

  constructor (p) {
    super(p)
    this.render()
    this.listenTo(this.config, 'change', this.render)
  }

  show (data, point, config) {
    if (!data) return this.hide()

    if (point[0] < config.x1 || point[0] > config.x2 || point[1] < config.y1 || point[1] > config.y2) {
      return this.hide()
    }
    // Draw crosshair line
    const svgCrosshair = this.d3.selectAll('.crosshair').data([config.line])
    const svgCrosshairEnter = svgCrosshair.enter().append('g')
      .attr('class', 'crosshair')
    svgCrosshairEnter.append('line')
      .attr('class', 'x-line')
      .attr('x1', (d) => d.x(data))
      .attr('x2', (d) => d.x(data))
      .attr('y1', (d) => d.y1)
      .attr('y2', (d) => d.y2)
    svgCrosshairEnter.append('text')
      .attr('class', 'x-text')
      .attr('x', (d) => d.x(data))
      .attr('y', (d) => d.y1 + 15)
      .text((d) => d.text(data))
    svgCrosshairEnter.append('g')
      .attr('class', 'bubbles')
    const svgCrosshairEdit = svgCrosshairEnter.merge(svgCrosshair)
      .transition().ease(d3.easeLinear).duration(this.config.get('duration'))
    svgCrosshairEdit.select('.x-line')
      .attr('x1', (d) => d.x(data))
      .attr('x2', (d) => d.x(data))
      .attr('y1', (d) => d.y1)
      .attr('y2', (d) => d.y2)
    svgCrosshairEdit.select('.x-text')
      .attr('x', (d) => d.x(data))
      .attr('y', (d) => d.y1 + 15)
      .text((d) => d.text(data))
    // Draw bubbles for all enabled y accessors.
    const svgBubbles = this.d3.select('.crosshair')
      .select('.bubbles')
      .selectAll('circle')
      .data(config.circles, (d) => d.id)
    svgBubbles.enter().append('circle')
      .attr('cx', (d) => d.x(data))
      .attr('cy', (d) => d.y(data))
      .attr('fill', (d) => d.color)
      .attr('r', 0)
      .merge(svgBubbles)
      .transition().ease(d3.easeLinear).duration(this.config.get('duration'))
      .attr('cx', (d) => d.x(data))
      .attr('cy', (d) => d.y(data))
      .attr('r', this.config.get('bubbleR'))
    svgCrosshair.exit().remove()

    // Show tooltip
    const pos = this.svg.node().getBoundingClientRect()
    const tooltipOffset = {
      left: point[0] + pos.left,
      top: point[1] + pos.top,
    }
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), tooltipOffset, data)
  }

  hide () {
    const svgCrosshair = this.d3.selectAll('.crosshair').data([])
    svgCrosshair.exit().remove()

    this._actionman.fire('HideComponent', this.config.get('tooltip'))
  }
}

module.exports = CrosshairView
