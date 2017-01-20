/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const shape = require('d3-shape')
const ContrailChartsView = require('contrail-charts-view')

class PieChartView extends ContrailChartsView {
  get type () { return 'pieChart' }
  get tagName () { return 'g' }
  get className () { return 'coCharts-pie-chart' }
  get events () {
    return {
      'mouseover .arc': '_onMouseover',
      'mouseout .arc': '_onMouseout',
    }
  }

  constructor (options = {}) {
    super(options)
    this._highlightRadius = 10
    this.listenTo(this.model, 'change', this._onDataModelChange)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    window.addEventListener('resize', _.throttle(() => { this.render() }, 100))
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this._onDataModelChange)
  }

  _calculateDimensions () {
    if (!this.params.chartWidth) {
      this.params.chartWidth = this._container.getBoundingClientRect().width
    }
    if (this.params.chartWidthDelta) {
      this.params.chartWidth += this.params.chartWidthDelta
    }
    if (!this.params.chartHeight) {
      this.params.chartHeight = Math.round(this.params.chartWidth / 2)
    }
    // TODO: use the 'axis' param to compute additional margins for the axis
  }

  render () {
    this.resetParams()
    this._calculateDimensions()
    super.render()
    const serieConfig = this.config.get('serie')
    const radius = this.config.get('radius')
    const data = this.model.get('data')

    const arc = shape.arc()
      .outerRadius(radius)
      .innerRadius(this.config.innerRadius)

    const pie = shape.pie()
      .sort(null)
      .value((d) => serieConfig.getValue(d))(data)

    this.d3
      .attr('transform', `translate(${this.params.chartWidth / 2}, ${this.params.chartHeight / 2})`)

    this.d3.selectAll('arc')
      .data(pie)
      .enter().append('path')
      .classed('arc', true)
      .attr('d', arc)
      .style('fill', (d) => this.config.getColor(serieConfig.getLabel(d.data)))
  }

  // Event handlers

  _onDataModelChange () {
    this.render()
  }

  _onConfigModelChange () {
    this.render()
  }

  _onMouseover (sector) {
    const serieConfig = this.config.get('serie')
    const outerRadius = this.config.get('radius')
    const innerRadius = this.config.innerRadius
    const chartOffset = this.svg.node().getBoundingClientRect()
    const tooltipOffset = {
      left: chartOffset.left + this.params.chartWidth / 2 - innerRadius * 0.707,
      top: chartOffset.top + this.params.chartHeight / 2 - innerRadius * 0.707,
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

module.exports = PieChartView
