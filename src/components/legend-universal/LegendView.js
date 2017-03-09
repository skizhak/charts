/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import '../legend/legend.scss'
import ContrailChartsView from 'contrail-charts-view'
import _template from './legend.html'

export default class LegendView extends ContrailChartsView {
  static get dataType () { return 'Serie' }

  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.getData(this.model))

    super.render(content)
  }
}
