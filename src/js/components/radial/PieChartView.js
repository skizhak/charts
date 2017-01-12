/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const shape = require('d3-shape')
const ContrailChartsView = require('contrail-charts-view')

class Self extends ContrailChartsView {
  get type () { return 'pieChart' }
  get className () { return 'coCharts-pie-chart' }

  constructor (options = {}) {
    super(options)
    this._highlightRadius = 10
    this.listenTo(this.model, 'change', this._onDataModelChange)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this._onDataModelChange)
  }

  render () {
    super.render()
    const width = this.config.get('chartWidth')
    const height = this.config.get('chartHeight')
    const serieConfig = this.config.get('serie')
    const radius = this.config.get('radius')
    const data = this.model.get('data')

    const arc = shape.arc()
      .outerRadius(radius)
      .innerRadius(this.config.getInnerRadius())

    const pie = shape.pie()
      .sort(null)
      .value((d) => serieConfig.getValue(d))(data)

    this.d3
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    this.d3.selectAll('arc')
      .data(pie)
      .enter().append('path')
      .classed('arc', true)
      .attr('d', arc)
      .style('fill', (d) => this.config.getColor(serieConfig.getLabel(d.data)))
      .on('mouseover', this._onHover.bind(this))
      .on('mouseout', this._onMouseout.bind(this))
  }

  // Event handlers

  _onDataModelChange () {
    this.render()
  }

  _onConfigModelChange () {
    this.render()
  }

  _onHover (sector) {
    // TODO consider case with missing width config in order to occupy all available space
    const serieConfig = this.config.get('serie')
    const width = this.config.get('chartWidth')
    const height = this.config.get('chartHeight')
    const outerRadius = this.config.get('radius')
    const innerRadius = this.config.getInnerRadius()
    const chartOffset = this.d3Container.node().getBoundingClientRect()
    const tooltipOffset = {
      left: chartOffset.left + width / 2 - innerRadius * 0.707,
      top: chartOffset.top + height / 2 - innerRadius * 0.707,
      width: innerRadius * 0.707 * 2,
      height: innerRadius * 0.707 * 2,
    }
    const arc = shape.arc(sector)
      .innerRadius(outerRadius)
      .outerRadius(outerRadius + this._highlightRadius)
      .startAngle(sector.startAngle)
      .endAngle(sector.endAngle)
    this.d3
      .append('path')
      .classed('arc', true)
      .classed('highlight', true)
      .attr('d', arc)
      .style('fill', this.config.getColor(serieConfig.getLabel(sector.data)))
    this._eventObject.trigger('showTooltip', tooltipOffset, sector.data)
  }

  _onMouseout (e) {
    this.d3.select('.highlight').remove()
  }
}

module.exports = Self
