/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./crosshair.scss')
import 'd3'
import ContrailChartsView from 'contrail-charts-view'

export default class CrosshairView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.render()
    this.listenTo(this.config, 'change', this.render)
  }

  get tagName () { return 'g' }
  get zIndex () { return 9 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.crosshair-line',
      line: '.x-line',
      text: '.x-text',
      bubble: '.bubble',
    })
  }
  /**
   * @param data
   * @param {Array [x, y]} point mouse offset relative to svg container
   * @param config
   */
  show (data, point, config) {
    if (!data) return this.hide()

    if (point[0] < config.x1 || point[0] > config.x2 || point[1] < config.y1 || point[1] > config.y2) {
      return this.hide()
    }
    // Draw crosshair line
    const lines = this.d3.selectAll(this.selectors.node).data([config.line])
    const linesEnter = lines.enter().append('g')
      .attr('class', this.selectorClass('node'))
    linesEnter
      .attr('transform', d => `translate(${d.x(data)}, 0)`)
      .merge(lines)
      .transition().ease(d3.easeLinear).duration(this.config.get('duration'))
      .attr('transform', d => `translate(${d.x(data)}, 0)`)
    linesEnter.append('line')
      .attr('class', this.selectorClass('line'))
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', d => d.y1)
      .attr('y2', d => d.y2)
    linesEnter.append('text')
      .attr('class', this.selectorClass('text'))
      .attr('y', d => d.y1 + 15)
      .text(d => d.text(data))
    const update = linesEnter.merge(lines)
    update.selectAll(this.selectors.line)
      .attr('y1', d => d.y1)
      .attr('y2', d => d.y2)
    update.selectAll(this.selectors.text)
      .attr('y', d => d.y1 + 15)
      .text(d => d.text(data))

    // Draw bubbles for all enabled y accessors.
    update.each((d, i, els) => {
      const bubbleData = _.filter(config.bubbles, bubble => !!data[bubble.id])
      const bubbles = d3.select(els[i]).selectAll(this.selectors.bubble)
        .data(bubbleData, d => d.id)
      bubbles.enter().append('circle')
        .classed(this.selectorClass('bubble'), true)
        .attr('cx', 0)
        .attr('cy', d => d.y(data))
        .attr('fill', d => d.color)
        .attr('r', 0)
        .merge(bubbles)
        .transition().ease(d3.easeLinear).duration(this.config.get('duration'))
        .attr('cy', d => d.y(data))
        .attr('r', this.config.get('bubbleR'))
      bubbles.exit().remove()
    })
    lines.exit().remove()

    // Show tooltip
    const tooltipPosition = {
      left: this.svgOffset.left + point[0],
      top: this.svgOffset.top + point[1],
    }
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), tooltipPosition, data)
  }

  hide () {
    const lines = this.d3.selectAll(this.selectors.node).data([])
    lines.exit().remove()

    this._actionman.fire('HideComponent', this.config.get('tooltip'))
  }
}
