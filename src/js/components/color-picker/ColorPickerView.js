/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./color-picker.html')

class ColorPickerView extends ContrailChartsView {
  get type () { return 'colorPicker' }
  get className () { return 'coCharts-color-picker-view' }
  get events () {
    return {
      'click .color-select': 'open',
      'click .color-picker-palette-close': 'close',
      'click .color-picker-palette-color': '_onSelectColor',
    }
  }

  constructor (options) {
    super(options)
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)

    super.render(content)
  }

  open (d, el) {
    const $elem = this.$(el)
    const label = $elem.find('.label').html()
    this._accessor = $elem.data('accessor')
    const paletteElement = this.$('.color-picker-palette')
    const elemOffset = $elem.position()
    elemOffset.left += $elem.outerWidth(true)
    paletteElement.css(elemOffset)
    paletteElement.find('.color-picker-palette-title').html(label)
    paletteElement.show()
  }

  close () {
    this.$('.color-picker-palette').hide()
  }

  // Event handlers

  _onSelectColor (d, el) {
    const color = el.style['background-color']
    const action = this._actionman.get('selectColor')
    action.apply(this._accessor, color)
  }
}

module.exports = ColorPickerView
