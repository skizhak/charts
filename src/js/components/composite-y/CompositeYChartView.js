/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
const LineChartView = require('components/composite-y/LineChartView')
const AreaChartView = require('components/composite-y/AreaChartView')
const BarChartView = require('components/composite-y/GroupedBarChartView')
const StackedBarChartView = require('components/composite-y/StackedBarChartView')
const ScatterPlotView = require('components/composite-y/ScatterPlotView')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')

class CompositeYChartView extends ContrailChartsView {
  get type () { return 'compositeY' }
  get tagName () { return 'g' }
  get className () { return 'coCharts-xy-chart' }
  get possibleChildViews () {
    return {
      line: LineChartView,
      area: AreaChartView,
      bar: BarChartView,
      stackedBar: StackedBarChartView,
      scatterPlot: ScatterPlotView,
    }
  }

  constructor (p) {
    super(p)
    this._drawings = []

    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
    window.addEventListener('resize', this._onWindowResize.bind(this))

    this._debouncedRenderFunction = _.bind(_.debounce(this._render, 10), this)
    this._throttledRender = _.throttle(() => { this.render() }, 100)
  }

  refresh () {
    this.config.trigger('change', this.config)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this.render)
    _.each(this._drawings, (drawing) => {
      drawing.model = model
    })
    this.render()
  }
  /**
  * Calculates the activeAccessorData that holds only the verified and enabled accessors from the 'plot' structure.
  * Params: activeAccessorData, yAxisInfoArray
  */
  _calculateActiveAccessorData () {
    this.params.activeAccessorData = []
    this.params.yAxisInfoArray = []
    // Initialize the drawings activeAccessorData structure
    _.each(this._drawings, (drawing) => {
      drawing.params.activeAccessorData = []
      drawing.params.enabled = false
    })
    // Fill the activeAccessorData structure.
    _.each(this.params.plot.y, (accessor) => {
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
   * Calculates the chart dimensions and margins.
   * Use the dimensions provided in the config. If not provided use all available width of container and 3/4 of this width for height.
   * This method should be called before rendering because the available dimensions could have changed.
   * Params: chartWidth, chartHeight, margin, marginTop, marginBottom, marginLeft, marginRight, marginInner.
   */
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
  /**
   * Use the scales provided in the config or calculate them to fit data in view.
   * Assumes to have the range values available in the DataProvider (model) and the chart dimensions available in params.
   * Params: xRange, yRange, xDomain, yDomain, xScale, yScale
   */
  calculateScales () {
    // Calculate the starting and ending positions in pixels of the chart data drawing area.
    this.params.xRange = [this.params.marginLeft + this.params.marginInner, this.params.chartWidth - this.params.marginRight - this.params.marginInner]
    this.params.yRange = [this.params.chartHeight - this.params.marginInner - this.params.marginBottom, this.params.marginInner + this.params.marginTop]
    this.saveScales()
    // Now let every drawing perform it's own calculations based on the provided X and Y scales.
    _.each(this._drawings, (drawing) => {
      if (_.isFunction(drawing.calculateScales)) {
        drawing.calculateScales()
      }
    })
  }

  calculateColorScale () {
    _.each(this.params.plot.y, (accessor) => {
      accessor.color = this.config.getColor(accessor)
    })
  }

  getDrawing (accessor) {
    return _.find(this._drawings, (drawing) => {
      return drawing.axisName === accessor.axis && drawing.type === accessor.chart
    })
  }
  /**
  * Combine the axis domains (extents) from all enabled drawings.
  */
  combineAxisDomains () {
    const domains = {}
    _.each(this._drawings, (drawing) => {
      if (drawing.params.enabled) {
        const drawingDomains = drawing.calculateAxisDomains()
        _.each(drawingDomains, (domain, axisName) => {
          if (!_.has(domains, axisName)) {
            domains[axisName] = [domain[0], domain[1]]
          } else {
            // check if the new domains extent extends the current one
            if (domain[0] < domains[axisName][0]) {
              domains[axisName][0] = domain[0]
            }
            if (domain[1] > domains[axisName][1]) {
              domains[axisName][1] = domain[1]
            }
          }
          // Override axis domain based on axis config.
          if (this.hasAxisParam(axisName, 'domain')) {
            if (!_.isUndefined(this.config.get('axis')[axisName].domain[0])) {
              domains[axisName][0] = this.config.get('axis')[axisName].domain[0]
            }
            if (!_.isUndefined(this.config.get('axis')[axisName].domain[1])) {
              domains[axisName][1] = this.config.get('axis')[axisName].domain[1]
            }
          }
        })
      }
    })
    return domains
  }
  /**
  * Save all scales in the params and drawing.params structures.
  */
  saveScales () {
    const domains = this.combineAxisDomains()
    if (!_.has(this.params, 'axis')) {
      this.params.axis = {}
    }
    _.each(domains, (domain, axisName) => {
      if (!_.has(this.params.axis, axisName)) {
        this.params.axis[axisName] = {}
      }
      if (!this.hasAxisParam(axisName, 'position')) {
        // Default axis position.
        if (axisName.charAt(0) === 'x') {
          this.params.axis[axisName].position = 'bottom'
        } else if (axisName.charAt(0) === 'y') {
          this.params.axis[axisName].position = 'left'
        }
      }
      if (!this.hasAxisParam(axisName, 'range')) {
        if (['bottom', 'top'].indexOf(this.params.axis[axisName].position) >= 0) {
          this.params.axis[axisName].range = this.params.xRange
        } else if (['left', 'right'].indexOf(this.params.axis[axisName].position) >= 0) {
          this.params.axis[axisName].range = this.params.yRange
        }
      }
      this.params.axis[axisName].domain = domain
      if (!_.isFunction(this.params.axis[axisName].scale) && this.params.axis[axisName].range) {
        let baseScale = null
        if (this.hasAxisConfig(axisName, 'scale') && _.isFunction(d3[this.config.get('axis')[axisName]])) {
          baseScale = d3[this.params.axis[axisName].scale]()
        } else if (['bottom', 'top'].indexOf(this.params.axis[axisName].position) >= 0) {
          baseScale = d3.scaleTime()
        } else {
          baseScale = d3.scaleLinear()
        }
        baseScale
          .domain(this.params.axis[axisName].domain)
          .range(this.params.axis[axisName].range)
        this.params.axis[axisName].scale = baseScale
        if (this.hasAxisParam(axisName, 'nice') && this.params.axis[axisName].nice) {
          if (this.hasAxisParam(axisName, 'ticks')) {
            this.params.axis[axisName].scale = this.params.axis[axisName].scale.nice(this.params.axis[axisName].ticks)
          } else {
            this.params.axis[axisName].scale = this.params.axis[axisName].scale.nice()
          }
        }
      }
    })
    // Now update the scales of the appropriate drawings.
    _.each(this._drawings, (drawing) => {
      drawing.params.axis = this.params.axis
    })
  }
  /**
   * Renders axis and drawing groups.
   * Resizes chart dimensions if chart already exists.
   */
  renderSVG () {
    const translate = this.params.xRange[0] - this.params.marginInner
    this.params.rectClipPathId = 'rect-clipPath-' + this.cid
    if (this.d3.select('clipPath').empty()) {
      this.d3.append('clipPath')
        .attr('id', this.params.rectClipPathId)
        .append('rect')
        .attr('x', this.params.xRange[0] - this.params.marginInner)
        .attr('y', this.params.yRange[1] - this.params.marginInner)
        .attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.params.marginInner)
        .attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)
      this.d3.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + (this.params.yRange[1] - this.params.marginInner) + ')')
    }
    // TODO merge with previous as enter / update
    // Handle (re)size.
    this.d3
      .select('#' + this.params.rectClipPathId).select('rect')
      .attr('x', this.params.xRange[0] - this.params.marginInner)
      .attr('y', this.params.yRange[1] - this.params.marginInner)
      .attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.params.marginInner)
      .attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)

    // Handle Y axis
    const svgYAxis = this.d3.selectAll('.axis.y-axis').data(this.params.yAxisInfoArray, (d) => d.name)
    svgYAxis.exit().remove()
    svgYAxis.enter()
      .append('g')
      .attr('class', (d) => `axis y-axis ${d.name}-axis`)
      .merge(svgYAxis)
      .attr('transform', 'translate(' + translate + ',0)')
    if (this.config.get('crosshairEnabled')) {
      this.svg.delegate('mousemove', 'svg', _.throttle(this._onMousemove.bind(this), 100))
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
   * Renders the axis.
   */
  renderAxis () {
    const xAxisName = this.params.plot.x.axis
    let xAxis = d3.axisBottom(this.params.axis[xAxisName].scale)
      .tickSize(this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)
      .tickPadding(10)
    if (this.hasAxisParam('x', 'ticks')) {
      xAxis = xAxis.ticks(this.params.axis[xAxisName].ticks)
    }
    if (this.hasAxisConfig('x', 'formatter')) {
      xAxis = xAxis.tickFormat(this.config.get('axis').x.formatter)
    }
    this.d3.transition().ease(d3.easeLinear).duration(this.params.duration)
    this.d3.select('.axis.x-axis').call(xAxis)
    // X axis label
    const xLabelData = []
    let xLabelMargin = 5
    if (this.hasAxisParam(xAxisName, 'labelMargin')) {
      xLabelMargin = this.params.axis[xAxisName].labelMargin
    }
    let xLabel = this.params.plot.x.labelFormatter || this.params.plot.x.label
    if (this.hasAxisParam(xAxisName, 'label')) {
      xLabel = this.params.axis[xAxisName].label
    }
    if (xLabel) {
      xLabelData.push(xLabel)
    }
    const xAxisLabelSvg = this.d3.select('.axis.x-axis').selectAll('.axis-label').data(xLabelData)
    xAxisLabelSvg.enter()
      .append('text')
      .attr('class', 'axis-label')
      .merge(xAxisLabelSvg) // .transition().ease( d3.easeLinear ).duration( this.params.duration )
      .attr('x', this.params.xRange[0] + (this.params.xRange[1] - this.params.xRange[0]) / 2)
      .attr('y', this.params.chartHeight - this.params.marginTop - xLabelMargin)
      .text((d) => d)
    xAxisLabelSvg.exit().remove()
    // We render the yAxis here because there may be multiple drawings for one axis.
    // The parent has aggregated information about all Y axis.
    let referenceYScale = null
    let yLabelX = 0
    let yLabelTransform = 'rotate(-90)'
    _.each(this.params.yAxisInfoArray, (axisInfo) => {
      let yLabelMargin = 12
      if (this.hasAxisParam(axisInfo.name, 'labelMargin')) {
        yLabelMargin = this.params.axis[axisInfo.name].labelMargin
      }
      yLabelX = 0 - this.params.marginLeft + yLabelMargin
      yLabelTransform = 'rotate(-90)'
      if (axisInfo.position === 'right') {
        yLabelX = this.params.chartWidth - this.params.marginLeft - yLabelMargin
        yLabelTransform = 'rotate(90)'
        axisInfo.yAxis = d3.axisRight(this.params.axis[axisInfo.name].scale)
          .tickSize((this.params.xRange[1] - this.params.xRange[0] + 2 * this.params.marginInner))
          .tickPadding(5)
      } else {
        axisInfo.yAxis = d3.axisLeft(this.params.axis[axisInfo.name].scale)
          .tickSize(-(this.params.xRange[1] - this.params.xRange[0] + 2 * this.params.marginInner))
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
        const referenceTickValues = _.map(ticks, (tickValue) => {
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
      let i = 0
      // There will be one label per unique accessor label displayed on this axis.
      _.each(axisInfo.accessors, (key) => {
        const foundActiveAccessorData = _.find(this.params.activeAccessorData, { accessor: key })
        if (!foundActiveAccessorData) return
        const label = foundActiveAccessorData.labelFormatter || foundActiveAccessorData.label
        if (!label) return
        const foundYLabelData = _.find(yLabelData, { label: label })
        if (!foundYLabelData) {
          let yLabelXDelta = 12 * i
          if (axisInfo.position === 'right') {
            yLabelXDelta = -yLabelXDelta
          }
          yLabelData.push({ label: label, x: yLabelX + yLabelXDelta })
          i++
        }
      })
      const yAxisLabelSvg = this.d3.select(`.axis.y-axis.${axisInfo.name}-axis`)
        .selectAll('.axis-label')
        .data(yLabelData, (d) => d.label)
      yAxisLabelSvg.enter()
        .append('text')
        .attr('class', 'axis-label')
        .merge(yAxisLabelSvg) // .transition().ease( d3.easeLinear ).duration( this.params.duration )
        // .attr( "x", yLabelX )
        // .attr( "y", this.params.yRange[1] + (this.params.yRange[0] - this.params.yRange[1]) / 2 )
        .attr('transform', (d) => 'translate(' + d.x + ',' + (this.params.yRange[1] + (this.params.yRange[0] - this.params.yRange[1]) / 2) + ') ' + yLabelTransform)
        .text((d) => d.label)
      yAxisLabelSvg.exit().remove()
    })
  }

  getCrosshairData (point) {
    const data = this.model.data
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    const xAccessor = this.params.plot.x.accessor
    const mouseX = xScale.invert(point[0])
    const xBisector = d3.bisector((d) => d[xAccessor]).right
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
    data.line.x = (dataElem) => {
      return globalXScale(dataElem[this.params.plot.x.accessor])
    }
    data.line.y1 = this.params.yRange[0]
    data.line.y2 = this.params.yRange[1]
    // Prepare x label text
    data.line.text = (dataElem) => {
      return data.xFormat(dataElem[this.params.plot.x.accessor])
    }
    // Prepare circle data
    _.each(this._drawings, (plotTypeComponent) => {
      _.each(plotTypeComponent.params.activeAccessorData, (accessor) => {
        const circleObject = {}
        circleObject.id = accessor.accessor
        circleObject.x = (dataElem) => {
          return plotTypeComponent.getScreenX(dataElem, this.params.plot.x.accessor, accessor.accessor)
        }
        circleObject.y = (dataElem) => {
          return plotTypeComponent.getScreenY(dataElem, accessor.accessor)
        }
        circleObject.color = accessor.color
        data.circles.push(circleObject)
      })
    })
    return data
  }

  render () {
    if (this.config) this._debouncedRenderFunction()
    return this
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
    _.each(plot.y, (accessor) => {
      if (!accessor.axis) {
        // Default y axis name.
        accessor.axis = 'y'
      }
      if (!_.has(accessor, 'enabled')) {
        accessor.enabled = true
      }
      if (accessor.chart && accessor.enabled) {
        let foundDrawing = this.getDrawing(accessor)
        if (!foundDrawing) {
          // The child drawing with this name does not exist yet. Instantiate the child drawing.
          _.each(this.possibleChildViews, (ChildView, chartType) => {
            if (chartType === accessor.chart) {
              const params = _.extend({}, this.params)
              params.isPrimary = false
              const compositeYConfig = new CompositeYChartConfigModel(params)
              foundDrawing = new ChildView({
                model: this.model,
                config: compositeYConfig,
                container: this._container,
                axisName: accessor.axis,
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
    _.each(this._drawings, (drawing) => { drawing.resetParams() })
  }

  _render () {
    this.resetParams()
    this._updateChildDrawings()
    this._calculateActiveAccessorData()
    this._calculateDimensions()
    this.calculateScales()
    this.calculateColorScale()

    super.render()
    this.renderSVG()
    this.renderAxis()
    _.each(this._drawings, (drawing) => {
      drawing.render()
    })

    this.trigger('render')
  }

  // Event handlers

  _onWindowResize () {
    this._throttledRender()
  }

  _onMousemove (d, el, e) {
    const point = [e.offsetX, e.offsetY]
    const data = this.getCrosshairData(point)
    const config = this.getCrosshairConfig()
    this._actionman.fire('ShowCrosshair', data, point, config)
  }
}

module.exports = CompositeYChartView
