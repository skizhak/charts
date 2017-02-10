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

  show (offset, data) {
    this._loadTemplate(data)
    this.$el.show()

    const tooltipWidth = this.$el.outerWidth()
    const tooltipHeight = this.$el.outerHeight()

    const bodyWidth = $('body').outerWidth()
    const bodyHeight = $('body').outerHeight()

    let tooltipPositionLeft = offset.left - tooltipWidth/2
    let tooltipPositionTop = offset.top - tooltipHeight - 10

    if(tooltipPositionTop < 0) {
      tooltipPositionTop = offset.top + 10
    }

    if(tooltipPositionLeft + tooltipWidth > bodyWidth) {
      tooltipPositionLeft = bodyWidth - tooltipWidth
    } else if (tooltipPositionLeft < 0) {
      tooltipPositionLeft = 0;
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
    const tooltipContent = this.config.getFormattedData(data)
    super.render(template(tooltipContent))
    // Todo Discuss if title needs to be handled via TitleView or using the tooltip template itself.
    if (tooltipContent.title) {
      TitleView(this.d3.select('.tooltip-content').node(), tooltipContent.title)
    }
  }
}

module.exports = TooltipView
