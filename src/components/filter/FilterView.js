/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./filter.scss')
import 'd3'
import ContrailChartsView from 'contrail-charts-view'
import _template from './filter.html'

export default class FilterView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
  }

  get events () {
    return {
      'change .filter-item-input': '_onItemClick',
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)

    super.render(content)
    this.d3.classed('hide', this.config.get('embedded'))
  }

  _onItemClick (d, el) {
    d3.event.stopPropagation()
    const accessorName = el.value
    const isChecked = el.checked
    this._actionman.fire('SelectSerie', accessorName, isChecked)
  }
}
