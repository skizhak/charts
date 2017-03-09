/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './bar-chart.scss'
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import XYChartSubView from 'components/composite-y/XYChartSubView'
import actionman from 'core/Actionman'

export default class StackedBarChartView extends XYChartSubView {
  get zIndex () { return 1 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.bar',
    })
  }

  get events () {
    return {
      [`mousemove ${this.selectors.node}`]: '_onMousemove',
      [`mouseout ${this.selectors.node}`]: '_onMouseout',
    }
  }
  /**
   * @override
   */
  get xMarginInner () {
    if (this.model.data.length < 2) return 0
    return this.bandWidth / 2
  }
  // TODO use memoize function
  get bandWidth () {
    if (_.isEmpty(this.model.data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 2 / 100)
    // TODO do not use model.data.length as there can be gaps
    // or fill the gaps in it beforehand
    return this.outerWidth / this.model.data.length * paddedPart
  }

  combineDomains () {
    const domains = super.combineDomains()
    const topY = _.reduce(this.params.activeAccessorData, (sum, accessor) => {
      return sum + this.model.getRangeFor(accessor.accessor)[1]
    }, 0)
    if (domains[this.axisName]) domains[this.axisName][1] = topY
    return domains
  }
  /**
  * @override
  * Y coordinate calculation considers position is being stacked
  */
  getScreenY (dataElem, yAccessor) {
    if (_.isNil(dataElem[yAccessor])) return undefined
    let stackedValue = 0
    _.takeWhile(this.params.activeAccessorData, accessorConfig => {
      stackedValue += (dataElem[accessorConfig.accessor] || 0)
      return accessorConfig.accessor !== yAccessor
    })
    return this.yScale(stackedValue)
  }

  render () {
    super.render()

    const start = this.yScale.range()[0]
    const barGroups = this.d3
      .selectAll(this.selectors.node)
      .data(this._prepareData(), d => d.id)
    barGroups.enter().append('rect')
      .attr('class', d => 'bar')
      .attr('x', d => d.x)
      .attr('y', start)
      .attr('height', 0)
      .attr('width', d => d.w)
      .merge(barGroups).transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('fill', d => d.color)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('height', d => d.h)
      .attr('width', d => d.w)
    barGroups.exit().remove()
  }

  _prepareData () {
    const data = this.model.data
    const start = this.yScale.domain()[0]
    const flatData = []
    const bandWidthHalf = (this.bandWidth / 2)
    _.each(data, d => {
      const x = d[this.params.plot.x.accessor]
      let stackedValue = start
      // y coordinate to stack next bar to
      _.each(this.params.activeAccessorData, accessor => {
        const key = accessor.accessor
        const value = d[key] || 0
        const obj = {
          id: x + '-' + key,
          x: this.xScale(x) - bandWidthHalf,
          y: this.yScale(value - start + stackedValue),
          h: this.yScale(start) - this.yScale(value + (stackedValue === start ? 0 : start)),
          w: this.bandWidth,
          color: this.config.getColor(d, accessor),
          accessor: accessor,
          data: d,
        }
        stackedValue += value
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMousemove (d, el, event) {
    if (this.config.get('tooltipEnabled')) {
      const [left, top] = d3Selection.mouse(this._container)
      actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }
}
