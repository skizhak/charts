/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./composite-y.scss')
const _ = require('lodash')
const d3 = require('d3')
const d3Array = require('d3-array')
const ContrailChartsView = require('contrail-charts-view')
const LineChartView = require('components/composite-y/LineChartView')
const AreaChartView = require('components/composite-y/AreaChartView')
const BarChartView = require('components/composite-y/GroupedBarChartView')
const StackedBarChartView = require('components/composite-y/StackedBarChartView')
const ScatterPlotView = require('components/composite-y/ScatterPlotView')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')
const TitleView = require('plugins/title/TitleView')

class CompositeYChartView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._drawings = []

    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    window.addEventListener('resize', this._onResize.bind(this))
  }

  get tagName () { return 'g' }

  get possibleChildViews () {
    return {
      LineChart: LineChartView,
      AreaChart: AreaChartView,
      BarChart: BarChartView,
      StackedBarChart: StackedBarChartView,
      ScatterPlot: ScatterPlotView,
    }
  }

  get xMarginInner () {
    return this.config.get('marginInner') + this.params.xMarginInner
  }

  refresh () {
    this.config.trigger('change', this.config)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this.render)
    _.each(this._drawings, drawing => {
      drawing.model = model
    })
    this.render()
  }

  render () {
    if (!this.config || !this._container) return
    this.resetParams()
    if (this.params.title) TitleView(this._container, this.params.title)
    this._updateChildDrawings()
    this._calculateActiveAccessorData()
    this._calculateDimensions()
    this.calculateScales()
    this.calculateColorScale()

    super.render()
    this.renderSVG()
    this.renderXAxis()
    this.renderYAxes()
    _.each(this._drawings, drawing => {
      drawing.render()
    })
    const crosshairId = this.config.get('crosshair')
    if (crosshairId) this._actionman.fire('HideComponent', crosshairId)

    this._ticking = false
  }

  showCrosshair (point) {
    const crosshairId = this.config.get('crosshair')
    const data = this.getCrosshairData(point)
    const config = this.getCrosshairConfig()
    this._actionman.fire('ShowComponent', crosshairId, data, point, config)

    // reset the tick so we can capture the next handler
    this._ticking = false
  }

  _calculateDimensions () {
    if (this._drawings[0]) {
      this.params.chartWidth = this._drawings[0].width
      this.params.chartHeight = this._drawings[0].height
    }
  }
  /**
  * Calculates the activeAccessorData that holds only the verified and enabled accessors from the 'plot' structure.
  * Params: activeAccessorData, yAxisInfoArray
  */
  _calculateActiveAccessorData () {
    this.params.activeAccessorData = []
    this.params.yAxisInfoArray = []
    // Initialize the drawings activeAccessorData structure
    _.each(this._drawings, drawing => {
      drawing.params.activeAccessorData = []
      drawing.params.enabled = false
    })
    // Fill the activeAccessorData structure.
    _.each(this.params.plot.y, accessor => {
      const drawing = this.getDrawing(accessor)
      if (drawing) {
        if (accessor.enabled) {
          this.params.activeAccessorData.push(accessor)
          let foundAxisInfo = _.find(this.params.yAxisInfoArray, { name: accessor.axis })
          const axisPosition = this.hasAxisParam(accessor.axis, 'position') ? this.params.axis[accessor.axis].position : 'left'
          if (!foundAxisInfo) {
            foundAxisInfo = {
              name: accessor.axis,
              used: 0,
              position: axisPosition,
              num: 0,
              accessors: [],
            }
            this.params.yAxisInfoArray.push(foundAxisInfo)
          }
          foundAxisInfo.used++
          foundAxisInfo.accessors.push(accessor.accessor)
          if (accessor.chart) {
            // Set the activeAccessorData to the appropriate drawings.
            if (drawing) {
              drawing.params.activeAccessorData.push(accessor)
              drawing.params.enabled = true
            }
          }
        }
      }
    })
  }
  /**
   * Use the scales provided in the config or calculate them to fit data in view.
   * Assumes to have the range values available in the DataProvider (model) and the chart dimensions available in params.
   * Params: xRange, yRange, xDomain, yDomain, xScale, yScale
   */
  calculateScales () {
    const p = this.params
    p.xMarginInner = _.max(_.map(this._drawings, 'xMarginInner'))
    p.xRange = [p.marginLeft + p.marginInner + p.xMarginInner, p.chartWidth - p.marginRight - p.marginInner - p.xMarginInner]
    p.yRange = [p.chartHeight - p.marginInner - p.marginBottom, p.marginInner + p.marginTop]
    this.saveScales()
  }

  calculateColorScale () {
    _.each(this.params.plot.y, accessor => {
      accessor.color = this.config.getColor(accessor)
    })
  }

  getDrawing (accessor) {
    return _.find(this._drawings, drawing => {
      return drawing.axisName === accessor.axis && drawing.type === accessor.chart
    })
  }
  /**
   * Combine series domains (extents) by axis
   */
  combineDomains () {
    const domains = {}
    _.each(this._drawings, drawing => {
      _.each(drawing.combineDomains(), (drawingDomain, axisName) => {
        domains[axisName] = d3Array.extent(_.concat(domains[axisName] || [], drawingDomain))
      })
    })
    return domains
  }
  /**
  * Save all scales in the params and drawing.params structures.
  */
  saveScales () {
    const domains = this.combineDomains()
    if (!_.has(this.params, 'axis')) {
      this.params.axis = {}
    }
    _.each(domains, (domain, axisName) => {
      if (!_.has(this.params.axis, axisName)) this.params.axis[axisName] = {}
      const axis = this.params.axis[axisName]

      axis.position = this.config.getPosition(axisName)
      if (!this.hasAxisParam(axisName, 'range')) {
        if (['bottom', 'top'].includes(axis.position)) {
          axis.range = this.params.xRange
        } else if (['left', 'right'].includes(axis.position)) {
          axis.range = this.params.yRange
        }
      }
      axis.domain = domain
      if (!_.isFunction(axis.scale) && axis.range) {
        const scale = this.config.getScale(axisName)
        scale
          .domain(axis.domain)
          .range(axis.range)
        axis.scale = scale
        if (this.hasAxisParam(axisName, 'nice') && axis.nice) {
          if (this.hasAxisParam(axisName, 'ticks')) {
            axis.scale = axis.scale.nice(axis.ticks)
          } else {
            axis.scale = axis.scale.nice()
          }
        }
      }
    })
    this.adjustAxisMargin()

    // Now update the scales of the appropriate drawings.
    _.each(this._drawings, drawing => {
      drawing.params.axis = this.params.axis
    })
  }
  /**
   * shrink x and y axises range to have margin for displaying of shapes sticking out of scale
   */
  adjustAxisMargin () {
    let sizeMargin = 0
    const sizeAxises = _.filter(this.params.axis, (axis, name) => name.match('size'))
    _.each(sizeAxises, axis => {
      // assume max shape extension out of scale range as of triangle's half edge
      // TODO margin should be based on the biggest triangle in the visible dataset but not the whole data
      const axisSizeMargin = Math.sqrt(axis.range[1] / Math.sqrt(3))
      if (axisSizeMargin > sizeMargin) sizeMargin = axisSizeMargin
    })
    if (!sizeMargin) return
    const axises = _.filter(this.params.axis, axis => axis.position && axis.range)
    _.each(axises, axis => {
      const axisMargin = ['left', 'right'].includes(axis.position) ? -sizeMargin : sizeMargin
      axis.scale.range([axis.range[0] + axisMargin, axis.range[1] - axisMargin])
    })
  }
  /**
   * Renders axis and drawing groups.
   * Resizes chart dimensions if chart already exists.
   */
  renderSVG () {
    const translate = this.params.xRange[0] - this.xMarginInner
    this.params.rectClipPathId = 'rect-clipPath-' + this.cid
    if (this.d3.select('clipPath').empty()) {
      this.d3.append('clipPath')
        .attr('id', this.params.rectClipPathId)
        .append('rect')
        .attr('x', this.params.xRange[0] - this.xMarginInner)
        .attr('y', this.params.yRange[1] - this.params.marginInner)
        .attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner)
        .attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)
      this.d3.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + (this.params.yRange[1] - this.params.marginInner) + ')')
    }
    // TODO merge with previous as enter / update
    // Handle (re)size.
    this.d3
      .select('#' + this.params.rectClipPathId).select('rect')
      .attr('x', this.params.xRange[0] - this.xMarginInner)
      .attr('y', this.params.yRange[1] - this.params.marginInner)
      .attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner)
      .attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)

    // Handle Y axis
    const svgYAxis = this.d3.selectAll('.axis.y-axis').data(this.params.yAxisInfoArray, d => d.name)

    // Do not remove last axis
    if (svgYAxis.nodes().length < 1) {
      const toRemove = svgYAxis.exit().nodes()
      _.each(toRemove.slice(1), node => node.remove())
    } else svgYAxis.exit().remove()

    svgYAxis.enter()
      .append('g')
      .attr('class', d => `axis y-axis ${d.name}-axis`)
      .merge(svgYAxis)
      .attr('transform', 'translate(' + translate + ',0)')

    if (this.config.get('crosshairEnabled')) {
      this.svg.delegate('mousemove', 'svg', this._onMousemove.bind(this))
    }
  }

  hasAxisConfig (axisName, axisAttributeName) {
    const axis = this.config.get('axis')
    return _.isObject(axis) && _.isObject(axis[axisName]) && !_.isUndefined(axis[axisName][axisAttributeName])
  }

  hasAxisParam (axisName, axisAttributeName) {
    return _.isObject(this.params.axis) && _.isObject(this.params.axis[axisName]) && !_.isUndefined(this.params.axis[axisName][axisAttributeName])
  }
  /**
   * Render x axis
   */
  renderXAxis () {
    const name = this.params.plot.x.axis
    const axis = this.params.axis[name]
    if (!axis.scale) return

    let d3Axis = d3.axisBottom(axis.scale)
      .tickSize(this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)
      .tickPadding(10)
    if (this.hasAxisParam('x', 'ticks')) {
      d3Axis = d3Axis.ticks(axis.ticks)
    }
    if (this.hasAxisConfig('x', 'formatter')) {
      d3Axis = d3Axis.tickFormat(this.config.get('axis').x.formatter)
    }
    this.d3.transition().ease(d3.easeLinear).duration(this.params.duration)
    this.d3.select('.axis.x-axis').call(d3Axis)

    const labelData = []
    let labelMargin = 5
    if (this.hasAxisParam(name, 'labelMargin')) {
      labelMargin = axis.labelMargin
    }
    let label = this.params.plot.x.labelFormatter || this.params.plot.x.label
    if (this.hasAxisParam(name, 'label')) label = axis.label
    if (label) labelData.push(label)

    const axisLabelElements = this.d3.select('.axis.x-axis').selectAll('.axis-label').data(labelData)
    axisLabelElements.enter()
      .append('text')
      .attr('class', 'axis-label')
      .merge(axisLabelElements)
      .attr('x', this.params.xRange[0] + (this.params.xRange[1] - this.params.xRange[0]) / 2)
      .attr('y', this.params.chartHeight - this.params.marginTop - labelMargin)
      .text(d => d)
    axisLabelElements.exit().remove()
  }

  renderYAxes () {
    // We render the yAxis here because there may be multiple drawings for one axis.
    // The parent has aggregated information about all Y axis.
    let referenceYScale = null
    let yLabelX = 0
    let yLabelTransform = 'rotate(-90)'
    _.each(this.params.yAxisInfoArray, axisInfo => {
      let yLabelMargin = this.config.get('labelMargin')
      if (this.hasAxisParam(axisInfo.name, 'labelMargin')) {
        yLabelMargin = this.params.axis[axisInfo.name].labelMargin
      }
      yLabelX = 0 - this.params.marginLeft + yLabelMargin
      yLabelTransform = 'rotate(-90)'
      if (axisInfo.position === 'right') {
        yLabelX = this.params.chartWidth - this.params.marginLeft - yLabelMargin
        yLabelTransform = 'rotate(90)'
        axisInfo.yAxis = d3.axisRight(this.params.axis[axisInfo.name].scale)
          .tickSize((this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner))
          .tickPadding(5)
      } else {
        axisInfo.yAxis = d3.axisLeft(this.params.axis[axisInfo.name].scale)
          .tickSize(-(this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner))
          .tickPadding(5)
      }
      if (this.hasAxisParam(axisInfo.name, 'ticks')) {
        axisInfo.yAxis = axisInfo.yAxis.ticks(this.params.axis[axisInfo.name].ticks)
      }
      if (!referenceYScale) {
        referenceYScale = this.params.axis[axisInfo.name].scale
      } else {
        // This is not the first Y axis so adjust the tick values to the first axis tick values.
        let ticks = referenceYScale.ticks(this.params.yTicks)
        if (this.hasAxisParam(axisInfo.name, 'ticks')) {
          ticks = referenceYScale.ticks(this.params.axis[axisInfo.name].ticks)
        }
        const referenceTickValues = _.map(ticks, tickValue => {
          return axisInfo.yAxis.scale().invert(referenceYScale(tickValue))
        })
        axisInfo.yAxis = axisInfo.yAxis.tickValues(referenceTickValues)
      }
      if (this.hasAxisConfig(axisInfo.name, 'formatter')) {
        axisInfo.yAxis = axisInfo.yAxis.tickFormat(this.config.get('axis')[axisInfo.name].formatter)
      }
      this.d3.select('.axis.y-axis.' + axisInfo.name + '-axis').call(axisInfo.yAxis)
      // Y axis label
      const yLabelData = []
      if (this.hasAxisConfig(axisInfo.name, 'label')) {
        yLabelData.push({label: this.config.get('axis')[axisInfo.name].label, x: yLabelX})
      } else {
        let i = 0
        // There will be one label per unique accessor label displayed on this axis.
        _.each(axisInfo.accessors, key => {
          const foundActiveAccessorData = _.find(this.params.activeAccessorData, { accessor: key })
          if (!foundActiveAccessorData) return
          const label = foundActiveAccessorData.labelFormatter || foundActiveAccessorData.label
          if (!label) return
          const foundYLabelData = _.find(yLabelData, { label: label })
          if (!foundYLabelData) {
            let yLabelXDelta = this.config.get('labelMargin') * i
            if (axisInfo.position === 'right') {
              yLabelXDelta = -yLabelXDelta
            }
            yLabelData.push({ label: label, x: yLabelX + yLabelXDelta })
            i++
          }
        })
      }
      const yAxisLabelSvg = this.d3.select(`.axis.y-axis.${axisInfo.name}-axis`)
        .selectAll('.axis-label')
        .data(yLabelData, d => d.label)
      yAxisLabelSvg.enter()
        .append('text')
        .attr('class', 'axis-label')
        .merge(yAxisLabelSvg)
        .attr('transform', d => 'translate(' + d.x + ',' + (this.params.yRange[1] + (this.params.yRange[0] - this.params.yRange[1]) / 2) + ') ' + yLabelTransform)
        .text(d => d.label)
      yAxisLabelSvg.exit().remove()
    })
  }

  getCrosshairData (point) {
    const data = this.model.data
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    const xAccessor = this.params.plot.x.accessor
    const mouseX = xScale.invert(point[0])
    const xBisector = d3.bisector(d => d[xAccessor]).right
    const indexRight = xBisector(data, mouseX, 0, data.length - 1)
    let indexLeft = indexRight - 1
    if (indexLeft < 0) indexLeft = 0
    let index = indexRight
    if (Math.abs(mouseX - data[indexLeft][xAccessor]) < Math.abs(mouseX - data[indexRight][xAccessor])) {
      index = indexLeft
    }
    return data[index]
  }
  // TODO move to CrosshairConfig
  getCrosshairConfig () {
    const data = { circles: [] }
    const globalXScale = this.params.axis[this.params.plot.x.axis].scale
    // Prepare crosshair bounding box
    data.x1 = this.params.xRange[0]
    data.x2 = this.params.xRange[1]
    data.y1 = this.params.yRange[1]
    data.y2 = this.params.yRange[0]
    // Prepare x label formatter
    data.xFormat = this.config.get('axis')[this.params.plot.x.axis].formatter
    if (!_.isFunction(data.xFormat)) {
      data.xFormat = d3.timeFormat('%H:%M')
    }
    // Prepare line coordinates
    data.line = {}
    data.line.x = datum => {
      return globalXScale(datum[this.params.plot.x.accessor])
    }
    data.line.y1 = this.params.yRange[0]
    data.line.y2 = this.params.yRange[1]
    // Prepare x label text
    data.line.text = datum => {
      return data.xFormat(datum[this.params.plot.x.accessor])
    }
    // Prepare circle data
    _.each(this._drawings, plotTypeComponent => {
      _.each(plotTypeComponent.params.activeAccessorData, accessor => {
        const circleObject = {}
        circleObject.id = accessor.accessor
        circleObject.x = datum => {
          return plotTypeComponent.getScreenX(datum, this.params.plot.x.accessor)
        }
        circleObject.y = datum => {
          return plotTypeComponent.getScreenY(datum, accessor.accessor)
        }
        circleObject.color = accessor.color
        data.circles.push(circleObject)
      })
    })
    return data
  }
  /**
  * Update the drawings array based on the plot.y.
  */
  _updateChildDrawings () {
    const plot = this.config.get('plot')
    if (!plot.x.axis) {
      // Default x axis name.
      plot.x.axis = 'x'
    }
    _.each(plot.y, accessor => {
      if (!accessor.axis) {
        // Default y axis name.
        accessor.axis = 'y'
      }
      // if accessor is not set to disabled treat it as enabled
      if (!_.has(accessor, 'enabled')) {
        accessor.enabled = true
      }
      if (accessor.chart && accessor.enabled) {
        let foundDrawing = this.getDrawing(accessor)
        if (!foundDrawing) {
          // The child drawing with this name does not exist yet. Instantiate the child drawing.
          _.each(this.possibleChildViews, (ChildView, chartType) => {
            if (chartType === accessor.chart) {
              const params = _.extend({}, this.params, {
                isPrimary: false,
                axisName: accessor.axis,
              })
              const compositeYConfig = new CompositeYChartConfigModel(params)
              foundDrawing = new ChildView({
                model: this.model,
                config: compositeYConfig,
                container: this._container,
                parent: this,
                actionman: this._actionman,
              })
              this._drawings.push(foundDrawing)
            }
          })
        }
      }
    })
    // Order the drawings so the highest order drawings get rendered first.
    this._drawings.sort((a, b) => a.renderOrder - b.renderOrder)
    _.each(this._drawings, drawing => { drawing.resetParams() })
  }

  // Event handlers
  _onConfigModelChange () {
    _.each(this._drawings, drawing => {
      drawing.config.set(this.config.attributes)
    })
    this.render()
  }

  _onMousemove (d, el, e) {
    const point = [e.offsetX, e.offsetY]
    if (!this._ticking) {
      window.requestAnimationFrame(this.showCrosshair.bind(this, point))
      this._ticking = true
    }
  }
}

module.exports = CompositeYChartView
