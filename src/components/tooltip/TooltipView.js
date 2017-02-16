// Copyright (c) Juniper Networks, Inc. All rights reserved.

require('./tooltip.scss')
const ContrailChartsView = require('contrail-charts-view')
const TitleView = require('plugins/title/TitleView')
const _template = require('./tooltip.html')

class TooltipView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.resetParams()
    this.config.container = p.container
    this.listenTo(this.config, 'change', this.resetParams)
  }
  /**
   * @param {Object} position relative to container: top, left in pixels
   * @param {Object} data to display
   */
  show (position, data) {
    this._loadTemplate(data)
    this.d3.classed('active', true)

    const width = this.el.offsetWidth
    const height = this.el.offsetHeight
    const containerWidth = this._container.offsetWidth

    let left = position.left - width / 2
    let top = position.top - height - 10

    if (top < 0) top = position.top + 10
    if (left + width > containerWidth) {
      left = containerWidth - width
    } else if (left < 0) left = 0

    this.el.style.top = `${top}px`
    this.el.style.left = `${left}px`
    this.el.style.height = `${position.height}px`
  }

  hide () {
    this.d3.classed('active', false)
  }

  _loadTemplate (data) {
    const template = this.config.get('template') || _template
    const tooltipContent = this.config.get('getFormattedData').bind(this.config)(data)
    super.render(template(tooltipContent))
    // Todo Discuss if title needs to be handled via TitleView or using the tooltip template itself.
    if (tooltipContent.title) {
      TitleView(this.d3.select('.tooltip-content').node(), tooltipContent.title)
    }
  }
}

module.exports = TooltipView
