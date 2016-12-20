/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')
var _template = require('./tooltip.html')

var TooltipView = ContrailChartsView.extend({
  type: 'tooltip',
  tagName: 'div',
  className: 'coCharts-tooltip-view',

  initialize: function (options) {
    var self = this
    self.id = options.id
    self.config = options.config
    self.listenTo(self.config, 'change', self.resetParams)
    self.eventObject = options.eventObject || _.extend({}, Events)
    self.listenTo(self.eventObject, 'showTooltip', self.show)
    self.listenTo(self.eventObject, 'hideTooltip', self.hide)
  },

  show: function (offset, data, id) {
    var self = this
    if (id && id !== self.id) return
    self.render(data)
    self.$el.show()

    // Tooltip dimmensions will be available after render.
    var tooltipWidth = self.$el.outerWidth()
    var tooltipHeight = self.$el.outerHeight()
    var windowWidth = $(document).width()
    var tooltipPositionTop = offset.top < 0 ? 0 : offset.top
    var tooltipPositionLeft = offset.left
    if ((offset.left + tooltipWidth) > windowWidth) {
      tooltipPositionLeft = windowWidth - (offset.left + tooltipWidth)
    }
    self.$el.css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft,
      width: offset.width,
      height: offset.height,
    })
  },

  hide: function () {
    var self = this
    self.$el.hide()
  },

  render: function (data) {
    var self = this
    if (!data) return
    var tooltipData = {}
    var dataConfig = self.config.get('dataConfig')
    var template = self.config.get('template') || _template
    tooltipData.items = _.map(dataConfig, function (datumConfig) {
      return {
        label: self.config.getLabel(data, datumConfig),
        value: self.config.getFormattedValue(data, datumConfig),
      }
    })
    tooltipData.title = self.config.get('title')
    var tooltipElement = $(template(tooltipData))
    self.$el.html(tooltipElement)
    $('body').append(self.$el)
  }
})

module.exports = TooltipView
