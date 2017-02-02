/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ _ */

require('./legend.scss')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./legend.html')

class LegendPanelView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
  }

  get events () {
    return {
      'change .legend-attribute': '_onItemClick',
      'click .edit-legend': '_toggleEditMode',
      'click .select.select--color': '_toggleColorSelectMenu',
      'click .select.select--chart': '_toggleChartSelectMenu',
      'click .swatch': '_selectColor',
      'click .chart-type': '_selectChartType'
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)

    super.render(content)
  }

  _onItemClick (d, el) {
    const accessorName = $(el).parents('.attribute').data('accessor')
    const isChecked = el.querySelector('input').checked
    this._actionman.fire('SelectSerie', accessorName, isChecked)
  }

  _toggleEditMode (d, el) {
    this.$el.toggleClass('edit-mode')
    this.$el.find('.attribute').toggleClass('edit')
    this.$el.find('.color-selector').hide()

    if(!this.config.attributes.editable.colorSelector) this.d3.selectAll('.select--color').hide()
    if(!this.config.attributes.editable.chartSelector) this.d3.selectAll('.select--chart').style('display', 'none')

    _.each(this.$el.find('.legend-attribute > input'), function (el) {
      if ($(el).prop('disabled')) {
        $(el).prop('disabled', false)
      } else {
        $(el).prop('disabled', true)
      }
    })
  }

  _toggleColorSelectMenu (d, el) {
    this._accessor = $(el).parents('.attribute').data('accessor')
    const paletteElement = this.$('.color-selector')
    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight(true) + 1
    paletteElement.css(elemOffset)
    paletteElement.toggle()
  }

  _toggleChartSelectMenu (d, el) {
    this._accessor = $(el).parents('.attribute').data('accessor')
    const paletteElement = this.$('.chart-selector')
    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight(true) + 1
    paletteElement.css(elemOffset)
    paletteElement.toggle()
  }

  _selectColor (d, el) {
    const color = $(el).css('background-color')
    this.$el.removeClass('edit-mode')
    $(el).parents('.color-selector').hide()
    this._actionman.fire('SelectColor', this._accessor, color)
  }

  _selectChartType (d, el) {
    const chartType = $(el).data('type')
    $(el).parents('.chart-selector').hide()
    this._actionman.fire('SelectChartType', this._accessor, chartType)
  }
}

module.exports = LegendPanelView
