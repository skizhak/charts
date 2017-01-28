/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./legend.scss')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./legend.html')

class LegendView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)
    super.render(content)
  }
}

module.exports = LegendView
