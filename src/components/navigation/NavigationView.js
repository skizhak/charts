/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsView from 'contrail-charts-view'
import CompositeYChartView from 'components/composite-y/CompositeYChartView'
import BrushView from 'components/brush/BrushView'
import BrushConfigModel from 'components/brush/BrushConfigModel'
import CompositeYChartConfigModel from 'components/composite-y/CompositeYChartConfigModel'
import Selection from 'handlers/Selection'

export default class NavigationView extends ContrailChartsView {
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
      model: this.model,
    })
    this._components = [this._brush, this._compositeYChartView]
    this.listenTo(this._brush, 'selection', _.throttle(this._onSelection))
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this._onModelChange)
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
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
    // TODO this will also trigger render async, but the next one is needed by following _update immediately
    this._compositeYChartView.config.set(this.config.attributes)
    this._compositeYChartView.render()
    this._update()
  }

  remove () {
    super.remove()
    _.each(this._components, (component) => {
      component.remove()
    })
    this._components = []
    this.stopListening(this._brush, 'selection')
    window.removeEventListener('resize', this._onResize)
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
    this._actionman.fire('ChangeSelection', this._selection, this.config.get('onChangeSelection'))
  }
  /**
   * Turn off selection for the animation period on resize
   */
  _onResize () {
    this._disabled = true
    this._debouncedEnable()
    if (!this._ticking) {
      window.requestAnimationFrame(this._update.bind(this))
      this._ticking = true
    }
  }
  /**
   * Composite Y component is updated on resize on its own
   */
  _update () {
    const p = this._compositeYChartView.params
    this.params.xScale = p.axis.x.scale
    this._brush.container = this.el
    this.config.set('xRange', p.xRange, {silent: true})
    this.config.set('yRange', p.yRange, {silent: true})
    this._brush.config.set({
      selection: this.config.selectionRange,
      xRange: p.xRange,
      yRange: p.yRange,
    }, {silent: true})
    this._brush.render()
    this._ticking = false
  }
}
