/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const CompositeYChartView = require('components/composite-y/CompositeYChartView')
const BrushView = require('components/brush/BrushView')
const BrushConfigModel = require('components/brush/BrushConfigModel')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')
const Selection = require('handlers/Selection')

class NavigationView extends ContrailChartsView {
  get type () { return 'navigation' }
  get className () { return 'navigation-view' }
  get events () {
    return {
      'click .prev>a': 'prevChunkSelected',
      'click .next>a': 'nextChunkSelected',
    }
  }
  constructor (p) {
    super(p)
    this._selection = new Selection(this.model.data)
    this._brush = new BrushView({
      config: new BrushConfigModel({
        isSharedContainer: true,
        selection: this.config.get('selection'),
      }),
    })
    const compositeYConfig = new CompositeYChartConfigModel()
    this._compositeYChartView = new CompositeYChartView({
      model: this.model,
      config: compositeYConfig,
    })
    this._compositeYChartView.on('render', this._onCompositeYRendered.bind(this))
    this._components = [this._brush, this._compositeYChartView]
    this.listenTo(this._brush, 'selection', _.throttle(this._onSelection))
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this._onModelChange)
  }

  render () {
    super.render()
    this.resetParams()
    this._compositeYChartView.container = this.el
    this._compositeYChartView.resetParams(this.params)
    this._compositeYChartView.render()
    return this
  }

  prevChunkSelected () {
    const range = this.model.getRange()
    const x = this.params.xAccessor
    const rangeDiff = range[x][1] - range[x][0]
    const queryLimit = {}
    queryLimit[x] = [range[x][0] - rangeDiff * 0.5, range[x][1] - rangeDiff * 0.5]
    this.model.queryLimit = queryLimit
  // TODO: show some waiting screen?
  }

  nextChunkSelected () {
    const range = this.model.getRange()
    const x = this.params.xAccessor
    const rangeDiff = range[x][1] - range[x][0]
    const queryLimit = {}
    queryLimit[x] = [range[x][0] + rangeDiff * 0.5, range[x][1] + rangeDiff * 0.5]
    this.model.queryLimit = queryLimit
  // TODO: show some waiting screen?
  }

  _onCompositeYRendered () {
    const params = this._compositeYChartView.params
    this.params.xScale = params.axis.x.scale
    const marginInner = params.marginInner
    this._brush.container = this.el
    const extent = [
      [params.xRange[0] - marginInner, params.yRange[1] - marginInner],
      [params.xRange[1] + marginInner, params.yRange[0] + marginInner],
    ]
    this._brush.config.set('extent', extent)
    this._brush.render()
  }

  // Event handlers

  _onModelChange () {
    this._selection.data = this.model.data
    this.render()
  }

  _onSelection (range) {
    const xAccessor = this.params.plot.x.accessor
    let xMin = this.params.xScale.invert(range[0])
    let xMax = this.params.xScale.invert(range[1])

    // TODO navigation should not know anything about the data it operates
    if (_.isDate(xMin)) xMin = xMin.getTime()
    if (_.isDate(xMax)) xMax = xMax.getTime()

    this._selection.filter(xAccessor, [xMin, xMax])
    this._actionman.fire('ChangeSelection', this._selection)
  }
}

module.exports = NavigationView
