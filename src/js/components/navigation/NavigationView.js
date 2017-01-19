/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const DataProvider = require('handlers/DataProvider')
const CompositeYChartView = require('components/composite-y/CompositeYChartView')
const BrushView = require('./BrushView')
const ContrailChartsConfigModel = require('contrail-charts-config-model')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')

class NavigationView extends ContrailChartsView {
  get type () { return 'navigation' }
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
    this._components = []
    this._brush = new BrushView({
      config: new ContrailChartsConfigModel({isSharedContainer: true}),
    })
    const compositeYConfig = new CompositeYChartConfigModel()
    this._compositeYChartView = new CompositeYChartView({
      model: this.model,
      config: compositeYConfig,
      eventObject: this._eventObject,
    })
    this._compositeYChartView.on('rendered', () => {
      this._brush.container = this.el
      this._brush.params = this._compositeYChartView.params
      this._brush.render()
    })
    this._components = [this._brush, this._compositeYChartView]
    this._throttledTriggerSelectionChange = _.throttle(this._triggerSelectionChange, 100).bind(this)
    this.listenTo(this._brush, 'brush', this._onSelection)
    this.listenTo(this.model, 'change', this.render)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this._focusDataProvider = new DataProvider({parentDataModel: this.model})
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    super.render()
    this.resetParams()
    this._compositeYChartView.container = this.el
    this._compositeYChartView.resetParams(this.params)
    this._compositeYChartView.render()
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

  _triggerSelectionChange (focusDomain) {
    const xAccessor = this.params.plot.x.accessor
    this._focusDataProvider.setRangeAndFilterData(focusDomain)
    this._eventObject.trigger('windowChanged', focusDomain[xAccessor][0], focusDomain[xAccessor][1])
  }

  // Event handlers

  _onSelection (domain) {
    const xAccessor = this.params.plot.x.accessor
    const focusDomain = {}
    focusDomain[xAccessor] = domain
    this.config.set({ focusDomain: focusDomain }, { silent: true })
    this._throttledTriggerSelectionChange(focusDomain)
  }
}

module.exports = NavigationView
