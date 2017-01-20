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
    super.render(_template(this.config.data.y))
  }

  _onItemClick (d, el) {
    d3.event.stopPropagation()
    const accessor = el.value
    const action = this._actionman.get('selectSerie')
    this.config.filter(accessor)
    action.apply(this.config.data)
  }
}

module.exports = FilterView
