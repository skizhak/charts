/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./filter.html')

class FilterView extends ContrailChartsView {
  get type () { return 'filter' }
  get className () { return 'coCharts-filter-view' }
  get events () {
    return {
      'change .filter-item-input': '_onItemClick',
    }
  }
  constructor (p) {
    super(p)
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
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

module.exports = FilterView
