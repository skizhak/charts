/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsView = require('contrail-charts-view')

class StandaloneView extends ContrailChartsView {
  get type () { return 'standalone' }
  get tagName () { return 'g' }
  get className () { return 'coCharts-standalone' }

  constructor (p) {
    super(p)
    this.render()
  }

  render () {
    super.render()
    this.d3.append('text')
      .text('standalone component')
    this.svg.classed('standalone-is-here', true)
  }
}

module.exports = StandaloneView
