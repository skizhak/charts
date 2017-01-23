/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./tooltip.html')

class TooltipView extends ContrailChartsView {
  get type () { return 'tooltip' }
  get className () { return 'coCharts-tooltip-view' }

  constructor (options) {
    super(options)
    this.resetParams()
    this.listenTo(this.config, 'change', this.resetParams)
    this.listenTo(this._eventObject, 'showTooltip', this.show)
    this.listenTo(this._eventObject, 'hideTooltip', this.hide)
  }

  show (offset, data, id) {
    if (id && id !== this.id) return
    if (_.isArray(this.params.acceptFilters) && this.params.acceptFilters.length > 0) {
      if (!_.includes(this.params.acceptFilters, id)) return
    }
    this.render(data)
    this.$el.show()

    // Tooltip dimensions will be available after render.
    const tooltipWidth = this.$el.outerWidth()
    const windowWidth = $(document).width()
    const tooltipPositionTop = offset.top < 0 ? 0 : offset.top
    let tooltipPositionLeft = offset.left
    if ((offset.left + tooltipWidth) > windowWidth) {
      tooltipPositionLeft = offset.left - tooltipWidth
    }
    this.$el.css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft,
      height: offset.height
    })
  }

  hide (id) {
    if (id && id !== this.id) return
    this.$el.hide()
  }

  render (data) {
    const template = this.config.get('template') || _template
    super.render(template(this.config.getFormattedData(data)))
  }
}

module.exports = TooltipView
