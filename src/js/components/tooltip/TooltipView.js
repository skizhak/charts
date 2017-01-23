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

  constructor (p) {
    super(p)
    this.resetParams()
    this.listenTo(this.config, 'change', this.resetParams)
  }

  show (offset, data) {
    this.render(data)
    this.$el.show()

    // Tooltip dimensions will be available after render.
    const tooltipWidth = this.$el.outerWidth()
    // const tooltipHeight = this.$el.outerHeight()
    const windowWidth = $(document).width()
    const tooltipPositionTop = offset.top < 0 ? 0 : offset.top
    let tooltipPositionLeft = offset.left
    if ((offset.left + tooltipWidth) > windowWidth) {
      tooltipPositionLeft = offset.left - tooltipWidth
    }
    this.$el.css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft,
      width: offset.width,
      height: offset.height
    })
  }

  hide () {
    this.$el.hide()
  }

  render (data) {
    if (!data) return
    const tooltipData = {}
    const dataConfig = this.config.get('dataConfig')
    const template = this.config.get('template') || _template
    tooltipData.items = _.map(dataConfig, (datumConfig) => {
      return {
        label: this.config.getLabel(data, datumConfig),
        value: this.config.getFormattedValue(data, datumConfig),
      }
    })
    tooltipData.title = this.config.get('title')

    super.render(template(tooltipData))
  }
}

module.exports = TooltipView
