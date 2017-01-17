/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const d3Ease = require('d3-ease')
const ContrailChartsView = require('contrail-charts-view')
const DataProvider = require('handlers/DataProvider')
const CompositeYChartView = require('components/composite-y/CompositeYChartView')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')

class NavigationView extends ContrailChartsView {
  get type () { return 'navigation' }
  get tagName () { return 'g' }
  get className () { return 'navigation-view' }
  get events () {
    return {
      'click .prev>a': 'prevChunkSelected',
      'click .next>a': 'nextChunkSelected',
    }
  }
  constructor (options) {
    super(options)
    this._focusDataProvider = new DataProvider({parentDataModel: this.model})
    this._isModelChanged = false
    this.brush = null
    this.compositeYChartView = null
    this._throttledTriggerSelectionChange = _.throttle(this._triggerSelectionChange, 100).bind(this)
    this._throttledRenderBrush = _.throttle(this._renderBrush, 100).bind(this)
    window.addEventListener('resize', this._onWindowResize.bind(this))
    this.listenTo(this.model, 'change', this.render)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this._focusDataProvider = new DataProvider({parentDataModel: this.model})
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    this.resetParams()
    super.render()
    if (!this.compositeYChartView) {
      // One time compositeYChartView initialization.
      this._initializeAndRenderCompositeYChartView()
    // From this moment the compositeYChartView is independent from NavigationView. It will react to config / model changes on it's own.
    }
    return this
  }

  get focusDataProvider () {
    return this._focusDataProvider
  }

  prevChunkSelected () {
    const range = this.model.getRange()
    const x = this.params.xAccessor
    const rangeDiff = range[x][1] - range[x][0]
    const queryLimit = {}
    queryLimit[x] = [range[x][0] - rangeDiff * 0.5, range[x][1] - rangeDiff * 0.5]
    this.model.setQueryLimit(queryLimit)
  // TODO: show some waiting screen?
  }

  nextChunkSelected () {
    const range = this.model.getRange()
    const x = this.params.xAccessor
    const rangeDiff = range[x][1] - range[x][0]
    const queryLimit = {}
    queryLimit[x] = [range[x][0] + rangeDiff * 0.5, range[x][1] + rangeDiff * 0.5]
    this.model.setQueryLimit(queryLimit)
  // TODO: show some waiting screen?
  }

  _initializeAndRenderCompositeYChartView () {
    const params = _.extend({}, this.params)
    params.isSharedContainer = true
    const compositeYConfig = new CompositeYChartConfigModel(params)
    this.compositeYChartView = new CompositeYChartView({
      model: this.model,
      config: compositeYConfig,
      container: this._wrapper.node(),
      eventObject: this._eventObject,
    })
    this.compositeYChartView.on('rendered', this._renderBrush.bind(this))
    this.compositeYChartView.render()
  }
  /**
  * This needs to be called after compositeYChartView is rendered because we need the params computed.
  */
  _renderBrush () {
    // TODO use ordered rendering instead of reattaching element to be the last
    setTimeout(() => {
      this.el.parentNode.removeChild(this.el)
      this.svg.append(() => this.el)
    }, 200)
    const compositeYParams = this.compositeYChartView.params
    const xScale = compositeYParams.axis[compositeYParams.plot.x.axis].scale
    const marginInner = this.params.marginInner
    const brushHandleHeight = 16 // this.params.yRange[0] - this.params.yRange[1]
    this.brush = d3.brushX()
      .extent([
        [compositeYParams.xRange[0] - marginInner, compositeYParams.yRange[1] - marginInner],
        [compositeYParams.xRange[1] + marginInner, compositeYParams.yRange[0] + marginInner]])
      .handleSize(10)
      .on('brush', () => {
        this._onBrushSelection(d3.event.selection)
      })
      .on('end', () => {
        const dataWindow = d3.event.selection
        if (!dataWindow) {
          this._removeBrush()
          this._renderBrush()
        } else {
          this._onBrushSelection(d3.event.selection)
        }
      })
    let gBrush = this.d3.select('g.brush')
    if (gBrush.empty()) {
      gBrush = this.d3.append('g')
      gBrush.selectAll('.handle--custom')
        .data([{type: 'w'}, {type: 'e'}])
        .enter().append('path')
        .classed('hide', true)
        .classed('handle--custom', true)
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(brushHandleHeight / 2)
          .startAngle(0)
          .endAngle((d, i) => { return i ? Math.PI : -Math.PI }))
    }
    gBrush.classed('brush', true).call(this.brush)
    if (_.isArray(this.params.selection)) {
      const brushGroup = this.d3.select('g.brush').transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      const xMin = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[0] / 100) + xScale.range()[0]
      const xMax = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[1] / 100) + xScale.range()[0]
      this.brush.move(brushGroup, [xMin, xMax])
    }
  }

  _removeBrush () {
    this.d3.select('g.brush').remove()
    this.brush = null
    this.config.unset('focusDomain', { silent: true })
    const newFocusDomain = {}
    this._focusDataProvider.setRangeAndFilterData(newFocusDomain)
  }

  _triggerSelectionChange (focusDomain) {
    const xAccessor = this.params.plot.x.accessor
    this._focusDataProvider.setRangeAndFilterData(focusDomain)
    this._eventObject.trigger('windowChanged', focusDomain[xAccessor][0], focusDomain[xAccessor][1])
  }

  // Event handlers

  _onBrushSelection (selection) {
    const compositeYParams = this.compositeYChartView.params
    const xAccessor = this.params.plot.x.accessor
    const xScale = compositeYParams.axis[this.params.plot.x.axis].scale
    const brushHandleCenter = (compositeYParams.yRange[0] - compositeYParams.yRange[1] + 2 * this.params.marginInner) / 2
    let xMin = xScale.invert(selection[0])
    let xMax = xScale.invert(selection[1])
    if (_.isDate(xMin)) xMin = xMin.getTime()
    if (_.isDate(xMax)) xMax = xMax.getTime()
    const focusDomain = {}
    focusDomain[xAccessor] = [xMin, xMax]
    this.config.set({ focusDomain: focusDomain }, { silent: true })
    this._throttledTriggerSelectionChange(focusDomain)
    const gHandles = this.d3.select('g.brush').selectAll('.handle--custom')
    gHandles
      // TODO class should be reapplied
      .classed('hide', false)
      .attr('transform', (d, i) => {
        return `translate(${selection[i]},${brushHandleCenter}) scale(1,2)`
      })
  }

  _onWindowResize () {
    this._throttledRenderBrush()
  }
}

module.exports = NavigationView
