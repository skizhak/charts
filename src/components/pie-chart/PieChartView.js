// Copyright (c) Juniper Networks, Inc. All rights reserved.

require('./pie-chart.scss')
const shape = require('d3-shape')
const ContrailChartsView = require('contrail-charts-view')
const TitleView = require('plugins/title/TitleView')

class PieChartView extends ContrailChartsView {
  constructor (p = {}) {
    super(p)
    this._highlightRadius = 10
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    window.addEventListener('resize', this._onResize.bind(this))
  }

  get tagName () { return 'g' }
  /**
   * follow same naming convention for all charts
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.arc',
    })
  }
  get events () {
    return {
      [`mousemove ${this.selectors.node}`]: '_onMousemove',
      [`mouseout ${this.selectors.node}`]: '_onMouseout',
      [`click ${this.selectors.node}`]: '_onClick',
    }
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    this.resetParams()
    if (this.params.title) TitleView(this._container, this.params.title)
    this._calculateDimensions()
    super.render()
    this._onMouseout()
    const serieConfig = this.config.get('serie')
    const radius = this.config.get('radius')
    const data = this.model.get('data')

    const arc = shape.arc()
      .outerRadius(radius)
      .innerRadius(this.config.innerRadius)

    const stakes = shape.pie()
      .sort(null)
      .value(d => serieConfig.getValue(d))(data)

    this.d3.attr('transform', `translate(${this.params.chartWidth / 2}, ${this.params.chartHeight / 2})`)

    const sectors = this.d3.selectAll(this.selectors.node)
      .data(stakes, d => d.value)

    sectors
      .enter().append('path')
      .classed('arc', true)
      .attr('d', arc)
      .style('fill', d => this.config.getColor([], serieConfig.getLabel(d.data)))
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

  _onMousemove (d, el, event) {
    const parentChart = $(el).parents('.cc-chart')
    const tooltipPosition = {
      left: event.clientX - $(parentChart).offset().left + $(window).scrollLeft(),
      top: event.clientY - $(parentChart).offset().top + $(window).scrollTop()
    }

    const onClickCursor = this.config.get('onClickCursor')
    if (onClickCursor) {
      d3.select(el)
        .classed('click-me', true)
        .style('cursor', () => (typeof (onClickCursor) === 'boolean') ? 'pointer' : onClickCursor)
    }

    el.classList.add('active')
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), tooltipPosition, d.data)
  }

  _onMouseout (d, el) {
    if (this.config.get('onClickCursor')) el.classList.remove('click-me')
    this._actionman.fire('HideComponent', this.config.get('tooltip'))
    _.each(el ? [el] : document.querySelectorAll(this.selectors.node), el => el.classList.remove('active'))
  }

  _onClick (d, el) {
    el.classList.remove('active')
    this._actionman.fire('OnClick', d.data, el, this.config.get('onClick'))
  }
}

module.exports = PieChartView
