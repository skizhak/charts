/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const CompositeYChartView = require('components/composite-y/CompositeYChartView')
const BrushView = require('components/brush/BrushView')
const BrushConfigModel = require('components/brush/BrushConfigModel')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')
const Selection = require('handlers/Selection')

class NavigationView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._selection = new Selection(this.model.data)
    this._brush = new BrushView({
      config: new BrushConfigModel({
        isSharedContainer: true,
      }),
    })
    const compositeYConfig = new CompositeYChartConfigModel(this.config.attributes)
    this._compositeYChartView = new CompositeYChartView({
      config: compositeYConfig,
    })
    this._components = [this._brush, this._compositeYChartView]
    this.listenTo(this._brush, 'selection', _.throttle(this._onSelection))
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this._onModelChange)
    window.addEventListener('resize', this._onResize.bind(this))
    this._debouncedEnable = _.debounce(() => { this._disabled = false }, this.config.get('duration'))
  }

  get events () {
    return {
      'click .prev>a': 'prevChunkSelected',
      'click .next>a': 'nextChunkSelected',
    }
  }

  render () {
    super.render()
    this.resetParams()
    this._compositeYChartView.container = this.el
    // This will render it also
    this._compositeYChartView.changeModel(this.model)

    const params = this._compositeYChartView.params
    this.params.xScale = params.axis.x.scale
    this._brush.container = this.el
    this.config.set('xRange', params.xRange, {silent: true})
    this.config.set('yRange', params.yRange, {silent: true})
    this._brush.config.set({
      extent: this.config.rangeMargined,
      selection: this.config.selectionRange,
    })
  }

  prevChunkSelected () {
    const range = this.model.getRange()
    const x = this.params.xAccessor
    const rangeDiff = range[x][1] - range[x][0]
    this.model.queryLimit = {
      [x]: [range[x][0] - rangeDiff * 0.5, range[x][1] - rangeDiff * 0.5],
    }
  // TODO: show some waiting screen?
  }

  nextChunkSelected () {
    const range = this.model.getRange()
    const x = this.params.xAccessor
    const rangeDiff = range[x][1] - range[x][0]
    this.model.queryLimit = {
      [x]: [range[x][0] + rangeDiff * 0.5, range[x][1] + rangeDiff * 0.5],
    }
  // TODO: show some waiting screen?
  }

  // Event handlers

  _onModelChange () {
    this._selection.data = this.model.data
    this.render()
  }

  _onSelection (range) {
    if (this._disabled) return
    const xAccessor = this.params.plot.x.accessor
    let xMin = this.params.xScale.invert(range[0])
    let xMax = this.params.xScale.invert(range[1])
    const sScale = this.config.get('selectionScale')
    this.config.set('selection', [sScale.invert(range[0]), sScale.invert(range[1])], {silent: true})

    // TODO navigation should not know anything about the data it operates
    if (_.isDate(xMin)) xMin = xMin.getTime()
    if (_.isDate(xMax)) xMax = xMax.getTime()

    this._selection.filter(xAccessor, [xMin, xMax])
    this._actionman.fire('ChangeSelection', this._selection)
  }
  /**
   * Turn off selection for the animation period on resize
   */
  _onResize () {
    this._disabled = true
    this._debouncedEnable()
  }
}

module.exports = NavigationView
