/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ _ */

require('./legend.scss')
const ContrailChartsView = require('contrail-charts-view')
const d3Color = require('d3-color')
const _template = require('./legend.html')
const _states = {
  DEFAULT: 'default',
  EDIT: 'edit'
}

class LegendPanelView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
    this._state = _states.DEFAULT
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

    if(this.config.data.axesCount > 1) {
      this.d3.selectAll('.axis').classed('active', true)
    }

    if(this._state === _states.EDIT) {
      this._setEditState()
    }
  }

  _toggleAttribute (d, el) {
    const accessorName = $(el).parents('.attribute').data('accessor')
    const isChecked = el.querySelector('input').checked
    this._actionman.fire('SelectSerie', accessorName, isChecked)
  }

  _setEditState () {
    this.$el.find('.attribute').toggleClass('edit')
    this.$el.find('.selector').removeClass('active')

    if(!this.config.attributes.editable.colorSelector) this.d3.selectAll('.select--color').style('display', 'none')
    if(!this.config.attributes.editable.chartSelector) this.d3.selectAll('.select--chart').style('display', 'none')

    _.each(this.$el.find('.legend-attribute > input'), (el) => {
      if (this._state === _states.DEFAULT) {
        $(el).prop('disabled', false)
      } else {
        $(el).prop('disabled', true)
      }
    })
  }

  _toggleEditMode (d, el) {
    this._state = this._state === _states.DEFAULT ? _states.EDIT : _states.DEFAULT
    this.$el.toggleClass('edit-mode')
    this._setEditState()
  }

  _toggleSelector (d, el) {
    this._accessor = $(el).parents('.attribute').data('accessor')
    const selectorElement = this.d3.select('.selector')
    selectorElement.classed('select--color', false).classed('select--chart', false)
    
    if(this.$el.find('.selector').hasClass('active')) {
      selectorElement.classed('active', false)
    } else if($(el).hasClass('select--color')) {

      selectorElement.classed('active', true).classed('select--color', true)
      const currentColor = d3Color.color($(el).data('color'))
      selectorElement.selectAll('.swatch--color')
      .filter(function (d, i, n) {
        return d3Color.color($(n[i]).data('color')).toString() === currentColor.toString()
      })
      .classed('selected', true)

    } else if ($(el).hasClass('select--chart')) {

      selectorElement.classed('active', true).classed('select--chart', true)
      const currentChart = $(el).data('chart-type')
      selectorElement.selectAll('.swatch--chart')
      .filter(function (d, i, n) {
        return $(n[i]).data('chart-type') === currentChart
      })
      .classed('selected', true)
    }

    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight(true) + 1
    selectorElement
    .style('top', elemOffset.top + 'px')
    .style('left', elemOffset.left + 'px')
  }

  _selectColor (d, el) {
    const color = $(el).css('background-color')
    this._actionman.fire('SelectColor', this._accessor, color)
  }

  _selectChartType (d, el) {
    const chartType = $(el).data('type')
    this._actionman.fire('SelectChartType', this._accessor, chartType)
  }
}

module.exports = LegendPanelView
