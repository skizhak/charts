/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./filter.html')

class Self extends ContrailChartsView.extend({
  events: {
    'change .filter-item-input': '_onItemClick',
  }
}) {
  constructor (options = {}) {
    super(options)
    this.type = 'filter'
    this.className = 'coCharts-filter-view'
    this.listenTo(this.config, 'change', this.render)
  }

  render () {
    super.render(_template(this.config.getData().y))
  }

  _onItemClick (e) {
    e.stopPropagation()
    const accessor = $(e.target).val()
    const action = this._actionman.get('selectSerie')
    this.config.filter(accessor)
    action.apply(this.config.getData())
  }
}

module.exports = Self
