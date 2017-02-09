/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

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
      'click .swatch--chart': '_selectChartType',
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)
    super.render(content)

    if (!this.config.attributes.filter) {
      this.d3.selectAll('.legend-attribute')
        .classed('disabled', true)
        .select('input')
        .property('disabled', true)
    }

    this.d3.classed('vertical', this.config.attributes.placement === 'vertical')
    this.d3.selectAll('.axis').classed('active', this.config.data.axesCount > 1)
    if (this._state === _states.EDIT) this._setEditState()
  }

  _toggleAttribute (d, el) {
    const accessorName = $(el).parents('.attribute').data('accessor')
    const isChecked = el.querySelector('input').checked
    this._actionman.fire('SelectSerie', accessorName, isChecked)
  }

  _setEditState () {
    this.$('.attribute').toggleClass('edit')
    this.d3.selectAll('.selector').classed('active', false)

    this.d3.selectAll('.select--color').classed('hide', !this.config.attributes.editable.colorSelector)
    this.d3.selectAll('.select--chart').classed('hide', !this.config.attributes.editable.chartSelector)

    _.each(this.el.querySelectorAll('.legend-attribute > input'), el => {
      el.disabled = this._state !== _states.DEFAULT
    })
  }

  _toggleEditMode (d, el) {
    this._state = this._state === _states.DEFAULT ? _states.EDIT : _states.DEFAULT
    this.el.classList.toggle('edit-mode')
    this._setEditState()
  }

  _toggleSelector (d, el) {
    this._accessor = $(el).parents('.attribute').data('accessor')
    const selectorElement = this.d3.select('.selector')
    selectorElement
      .classed('select--color', false)
      .classed('select--chart', false)
    selectorElement.selectAll('.swatch').classed('selected', false)

    if (this.el.querySelector('.selector').classList.contains('active')) {
      selectorElement.classed('active', false)
    } else if (el.classList.contains('select--color')) {
      selectorElement.classed('active', true).classed('select--color', true)
      const currentColor = d3Color.color(el.dataset.color)
      selectorElement.selectAll('.swatch--color')
        .filter(function (d, i, n) {
          return d3Color.color(n[i].dataset.color).toString() === currentColor.toString()
        })
        .classed('selected', true)
    } else if (el.classList.contains('select--chart')) {
      selectorElement
        .classed('active', true)
        .classed('select--chart', true)
      const currentChart = el.dataset['chart-type']
      selectorElement.selectAll('.swatch--chart')
        .filter(function (d, i, n) {
          return n[i].dataset['chart-type'] === currentChart
        })
        .classed('selected', true)
    }

    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight() + 1
    selectorElement
      .style('top', elemOffset.top + 'px')
      .style('left', elemOffset.left + 'px')
  }

  _selectColor (d, el) {
    const color = window.getComputedStyle(el).backgroundColor
    this._actionman.fire('SelectColor', this._accessor, color)
  }

  _selectChartType (d, el) {
    const chartType = el.dataset['chart-type']
    this._actionman.fire('SelectChartType', this._accessor, chartType)
  }
}

module.exports = LegendPanelView
