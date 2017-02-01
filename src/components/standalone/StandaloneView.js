/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsView = require('contrail-charts-view')

class StandaloneView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.render()
  }

  get tagName () { return 'g' }

  render () {
    super.render()
    this.d3.append('text')
      .text('standalone component')
    this.svg.classed('standalone-is-here', true)
  }
}

module.exports = StandaloneView
