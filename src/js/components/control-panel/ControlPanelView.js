/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('underscore')
var ContrailChartsView = require('contrail-charts-view')

class ControlPanelView extends ContrailChartsView {
  get type () { return 'controlPanel' }
  get className () { return 'coCharts-control-panel-view' }

  get expandedTemplates () {
    return {
      accessorData: 'SOME_TEMPLATE_ID'
    }
  }

  get events () {
    return {
      'click .control-panel-item': 'controlPanelItemClicked',
      'click .control-panel-filter-close': 'controlPanelExpandedCloseButtonClicked',
      'change .accessor-data-checkbox': 'accessorDataCheckboxChanged',
      'change .accessor-data-chart-type-select': 'accessorDataSelectChanged'
    }
  }

  constructor (options) {
    super(options)
    this.listenTo(this.config, 'change', this.render)
  }

  controlPanelItemClicked (d, el) {
    var $button = $(el).closest('.control-panel-item')
    var buttonName = $button.attr('data-name')
    var button = _.findWhere(this.config.get('buttons'), { name: buttonName })
    if (button) {
      this.params.activeButton = button
      if (_.isObject(button.events) && button.events.click) {
        if (_.isString(button.events.click)) {
          this._eventObject.trigger(button.events.click, this.params)
        } else if (_.isFunction(button.events.click)) {
          _.bind(button.events.click, this)()
        }
      }
      if (_.has(button, 'panel') && button.panel.name) {
        var $expandedPanel = this.$el.find('.control-panel-expanded-container')
        if (!$expandedPanel.hasClass('hide')) {
          // Panel already open.
          if (this.params.activePanel === button.panel.name) {
            // Same panel open so close it.
            $expandedPanel.addClass('hide')
            this.params.activePanel = null
          } else {
            // Different panel open so replace it.
            this.renderPanel(button.panel.name)
            this.params.activePanel = button.panel.name
          }
        } else {
          // Panel not open so open it
          $expandedPanel.removeClass('hide')
          this.renderPanel(button.panel.name)
          this.params.activePanel = button.panel.name
        }
      }
    }
  }

  controlPanelExpandedCloseButtonClicked (e) {
    this.$el.find('.control-panel-expanded-container').addClass('hide')
  }

  accessorDataCheckboxChanged (d, el) {
    var plot = this.config.get('plot')
    this.$el.find('.accessor-data-checkbox').each(() => {
      var checked = el.checked
      var key = el.value
      var accessor = _.find(plot.y, { accessor: key })
      if (accessor) {
        accessor.enabled = checked
      }
    })
    this.config.trigger('change:plot')
  }

  accessorDataSelectChanged (d, el) {
    var plot = this.config.get('plot')
    this.$el.find('.accessor-data-chart-type-select').each(() => {
      var selectedChartType = el.value
      var key = el.getAttribute('name')
      var accessor = _.find(plot.y, { accessor: key })
      if (selectedChartType && accessor) {
        accessor.chart = selectedChartType
      }
    })
    this.config.trigger('change:plot')
  }

  generateExpandedPanel (params) {
    var $container = $('<div class="control-panel-filter-container"></div>')
    var $panelHead = $('<div class="control-panel-filter-head"></div>')
    $panelHead.append('<span class="control-panel-filter-head-icon"><i class="' + params.activeButton.iconClass + '"></i></span>')
    $panelHead.append('<span class="control-panel-filter-title-text">' + params.activeButton.title + '</span>')
    $panelHead.append('<span class="control-panel-filter-close"><i class="fa fa-remove"></i></span>')
    var $panelBody = $('<div class="control-panel-filter-body"></div>')
    var $filterItems = $('<div class="control-panel-filter-items"></div>')
    _.each(params.plot.y, (accessor) => {
      var key = accessor.accessor
      var $filterItem = $('<div class="control-panel-filter-item"></div>')
      var $checkbox = $('<input id="filter-item-input-' + key + '" type="checkbox" name="control-panel-filter" class="accessor-data-checkbox" value="' + key + '"/>')
      if (accessor.enabled) {
        $checkbox.prop('checked', true)
      }
      var $label = $('<label for="filter-item-input-' + key + '" class="accessor-data-checkbox-label"> ' + this.config.getLabel(undefined, accessor) + '</label>')
      $filterItem.append($checkbox)
      $filterItem.append($label)
      if (accessor.possibleChartTypes) {
        var $chartTypeSelector = $('<select class="accessor-data-chart-type-select" name="' + key + '"></select>')
        _.each(accessor.possibleChartTypes, (chartType) => {
          var $option = $('<option value="' + chartType.chart + '">' + this.config.getLabel(undefined, chartType) + '</option>')
          if (accessor.chart === chartType.chart) {
            $option.prop('selected', true)
          }
          $chartTypeSelector.append($option)
        })
        $filterItem.append($chartTypeSelector)
      }
      $filterItems.append($filterItem)
    })
    $panelBody.append($filterItems)
    $container.append($panelHead)
    $container.append($panelBody)
    return $container
  }

  renderPanel (panelName) {
    if (this.expandedTemplates[panelName]) {
      var $expandedPanelContainer = this.$el.find('.control-panel-expanded-container')
      $expandedPanelContainer.html(this.generateExpandedPanel(this.params))
      if (this.params.activeButton.panel.width) {
        $expandedPanelContainer.css({ width: this.params.activeButton.panel.width })
      }
    }
  }

  generateItems (params) {
    var $controlPanelItems = $('<div class="control-panel-items"></div>')
    _.each(params.buttons, (button) => {
      var $button = $('<button data-name="' + button.name + '" title="' + button.title + '"></button>')
      $button.append('<i class="' + button.iconClass + '"></i>')
      $button.addClass('control-panel-item')
      $button.addClass('control-panel-item-' + button.name)
      $controlPanelItems.append($button)
    })
    return $controlPanelItems
  }

  render () {
    this.resetParams()
    this.$el.html(this.generateItems(this.params))
    this.$el.append('<div class="control-panel-expanded-container hide"></div>')
    super.render()
  }
}

module.exports = ControlPanelView
