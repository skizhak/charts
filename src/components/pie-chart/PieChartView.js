/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
require('./pie-chart.scss')
const shape = require('d3-shape')
const ContrailChartsView = require('contrail-charts-view')

class PieChartView extends ContrailChartsView {
  constructor (p = {}) {
    super(p)
    this._highlightRadius = 10
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    window.addEventListener('resize', this._onResize.bind(this))
  }

  get tagName () { return 'g' }
  get events () {
    return {
      'mouseover .arc': '_onMouseover',
      'mouseout .arc': '_onMouseout',
    }
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this.render)
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

    const stakes = shape.pie()
      .sort(null)
      .value((d) => serieConfig.getValue(d))(data)

    this.d3.attr('transform', `translate(${this.params.chartWidth / 2}, ${this.params.chartHeight / 2})`)

    const sectors = this.d3.selectAll('.arc')
      .data(stakes, d => d.value)

    sectors
      .enter().append('path')
      .classed('arc', true)
      .attr('d', arc)
      .style('fill', (d) => this.config.getColor(serieConfig.getLabel(d.data)))
    sectors.exit().remove()

    this._ticking = false
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

  // Event handlers

  _onMouseover (sector, el) {
    const serieConfig = this.config.get('serie')
    const outerRadius = this.config.get('radius')
    const innerRadius = this.config.innerRadius
    const arc = shape.arc(sector).innerRadius(innerRadius).outerRadius(outerRadius)
    const labelPos = arc.centroid(sector)

    el.classList.add('highlight')

    const tooltipOffset = {
      left: this.params.chartWidth / 2 + labelPos[0],
      top: this.params.chartHeight / 2 + labelPos[1]
    }

    sector.data.color = this.config.getColor(serieConfig.getLabel(sector.data))
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), tooltipOffset, sector.data)
  }

  _onMouseout (d, el) {
    el.classList.remove('highlight')
    this._actionman.fire('HideComponent', this.config.get('tooltip'))
  }
}

module.exports = PieChartView
