/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

require('./tooltip.scss')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./tooltip.html')

class TooltipView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.resetParams()
    this.config.container = p.container
    this.listenTo(this.config, 'change', this.resetParams)
  }

  show (offset, data) {
    this._loadTemplate(data)
    this.$el.show()

    // Tooltip dimensions will be available after render.
    const tooltipWidth = this.$el.outerWidth()
    const containerWidth = this.config.container.offsetWidth
    const containerHeight = this.config.container.offsetHeight // eslint-disable-line

    const tooltipPositionTop = offset.top < 0 ? 0 : offset.top
    let tooltipPositionLeft = offset.left

    if ((offset.left + tooltipWidth) > containerWidth) {
      tooltipPositionLeft = offset.left - tooltipWidth
    }

    this.$el.css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft,
      height: offset.height
    })
  }

  hide () {
    this.$el.hide()
  }

  _loadTemplate (data) {
    const template = this.config.get('template') || _template
    super.render(template(this.config.getFormattedData(data)))
  }
}

module.exports = TooltipView
