/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const _ = require('lodash')
const Events = require('contrail-charts-events')
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
    this.$el.html(_template(this.config.get('plot').y))
  }

  _onItemClick (e) {
    e.stopPropagation()
    const accessor = $(e.target).val()
    const action = this._actionman.get('selectSerie')
    const series = this.config.attributes.plot.y
    const serieConfig = _.find(series, {accessor})
    serieConfig.enabled = !serieConfig.enabled
    action.apply(this.config.attributes.plot)
  }
}

module.exports = Self
