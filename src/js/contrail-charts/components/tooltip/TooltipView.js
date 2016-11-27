/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailChartsView = require('contrail-charts-view')

var TooltipView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'coCharts-tooltip-view',

  initialize: function (options) {
    this.config = options.config
    this.resetParams()
    this.params.show = 0
  },

  registerTriggerEvent: function (eventObject, showEventType, hideEventType) {
    this.listenTo(eventObject, showEventType, this.show)
    this.listenTo(eventObject, hideEventType, this.hide)
  },

  generateTooltipHTML: function (data, accessor) {
    var tooltipConfig = {}
    var fnGenerateTooltipHTML = this.config.get('generateTooltipHTML')
    if (accessor.tooltip) {
      tooltipConfig = this.config.get(accessor.tooltip)
      if (_.isFunction(tooltipConfig.generateTooltipHTML)) {
        fnGenerateTooltipHTML = tooltipConfig.generateTooltipHTML
      }
    }
    return fnGenerateTooltipHTML(data, accessor, tooltipConfig)
  },

  show: function (tooltipData, offsetLeft, offsetTop, accessor) {
    var self = this
    self.params.show++
    var tooltipElement = $(self.generateTooltipHTML(tooltipData, accessor))
    $('body').append(this.$el)
    this.$el.html(tooltipElement)
    this.$el.show()

    // Tooltip dimmensions will be available after render.
    var tooltipWidth = tooltipElement.width()
    var tooltipHeight = tooltipElement.height()
    var windowWidth = $(document).width()
    var tooltipPositionTop = 0
    var tooltipPositionLeft = offsetLeft
    if (offsetTop > tooltipHeight / 2) {
      tooltipPositionTop = offsetTop - tooltipHeight / 2
    }
    if ((windowWidth - offsetLeft - 25) < tooltipWidth) {
      tooltipPositionLeft = offsetLeft - tooltipWidth - 10
    } else {
      tooltipPositionLeft += 20
    }
    $(tooltipElement).css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft
    })
  },

  hide: function (d, x, y) {
    var self = this
    self.params.show--
    _.delay(function () {
      if (self.params.show <= 0) {
        self.$el.hide()
      }
    }, 1000)
  },

  render: function () {}
})

module.exports = TooltipView