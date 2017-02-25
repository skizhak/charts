// Copyright (c) Juniper Networks, Inc. All rights reserved.

import './pie-chart.scss'
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import ContrailChartsView from 'contrail-charts-view'
import TitleView from 'plugins/title/TitleView'

export default class PieChartView extends ContrailChartsView {
  constructor (p = {}) {
    super(p)
    this._highlightRadius = 10
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  get tagName () { return 'g' }
  /**
   * follow same naming convention for all charts
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.arc',
      active: '.active',
      click: '.click'
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

    const arc = d3Shape.arc()
      .outerRadius(radius)
      .innerRadius(this.config.innerRadius)

    const stakes = d3Shape.pie()
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

  remove () {
    super.remove()
    window.removeEventListener('resize', this._onResize)
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
    const [left, top] = d3Selection.mouse(this._container)
    const onClickCursor = this.config.get('onClickCursor')
    if (onClickCursor) {
      d3Selection.select(el)
        .classed(this.selectorClass('click'), true)
        .style('cursor', () => (typeof (onClickCursor) === 'boolean') ? 'pointer' : onClickCursor)
    }

    el.classList.add(this.selectorClass('active'))
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d.data)
  }

  _onMouseout (d, el) {
    if (this.config.get('onClickCursor') && el) el.classList.remove(this.selectorClass('click'))

    this._actionman.fire('HideComponent', this.config.get('tooltip'))
    const els = el ? this.d3.select(() => el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }

  _onClick (d, el) {
    el.classList.remove(this.selectorClass('active'))
    this._actionman.fire('OnClick', d.data, el, this.config.get('onClick'))
  }
}
