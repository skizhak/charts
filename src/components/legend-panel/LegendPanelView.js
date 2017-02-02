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
      'change .legend-attribute': '_toggleAttribute',
      'click .edit-legend': '_toggleEditMode',
      'click .select': '_toggleSelector',
      'click .swatch--color': '_selectColor',
      'click .swatch--chart': '_selectChartType'
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)
    super.render(content)

    if(!this.config.attributes.filter) {
      this.d3.selectAll('.legend-attribute')
             .classed('disabled', true)
             .select('input')
             .property('disabled', true)
    }

    if(this.config.attributes.placement === 'vertical') {
      this.$el.addClass('vertical')
    }
  }

  _toggleAttribute (d, el) {
    const accessorName = $(el).parents('.attribute').data('accessor')
    const isChecked = el.querySelector('input').checked
    this._actionman.fire('SelectSerie', accessorName, isChecked)
  }

  _toggleEditMode (d, el) {
    this.$el.toggleClass('edit-mode')
    this.$el.find('.attribute').toggleClass('edit')
    this.$el.find('.selector').removeClass('active')

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

  _toggleSelector (d, el) {
    this._accessor = $(el).parents('.attribute').data('accessor')
    const selectorElement = this.d3.select('.selector')
    selectorElement.classed('select--color', false).classed('select--chart', false)
    
    if(this.$el.find('.selector').hasClass('active')) {
      selectorElement.classed('active', false)
    } else if($(el).hasClass('select--color')) {
      selectorElement.classed('active', true).classed('select--color', true)
    } else if ($(el).hasClass('select--chart')) {
      selectorElement.classed('active', true).classed('select--chart', true)
    }

    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight(true) + 1
    selectorElement
    .style('top', elemOffset.top + 'px')
    .style('left', elemOffset.left + 'px')
  }

  _selectColor (d, el) {
    const color = $(el).css('background-color')
    this.$el.removeClass('edit-mode')
    $(el).parents('.color-selector').hide()
    this._actionman.fire('SelectColor', this._accessor, color)
  }

  _selectChartType (d, el) {
    const chartType = $(el).data('type')
    this.$el.removeClass('edit-mode')
    $(el).parents('.chart-selector').hide()
    this._actionman.fire('SelectChartType', this._accessor, chartType)
  }
}

module.exports = LegendPanelView
