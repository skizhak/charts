/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./tooltip.html')

class Self extends ContrailChartsView {
  get type () { return 'tooltip' }
  get tagName () { return 'div' }
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
    // const tooltipHeight = this.$el.outerHeight()
    const windowWidth = $(document).width()
    const tooltipPositionTop = offset.top < 0 ? 0 : offset.top
    let tooltipPositionLeft = offset.left
    if ((offset.left + tooltipWidth) > windowWidth) {
      tooltipPositionLeft = windowWidth - (offset.left + tooltipWidth)
    }
    this.$el.css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft,
      width: offset.width,
      height: offset.height
    })
  }

  hide (id) {
    if (id !== this.id) return
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
    const tooltipElement = $(template(tooltipData))

    ContrailChartsView.prototype.render.call(this, tooltipElement)
  }
}

module.exports = Self
