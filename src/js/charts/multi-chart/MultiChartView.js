/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
// Todo doesn't work. loop issue.
// const charts = require('charts/index')
const charts = {
  XYChartView: require('charts/xy-chart/XYChartView'),
  RadialChartView: require('charts/radial-chart/RadialChartView'),
}
const components = require('components/index')

class ChartView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._charts = {}
    this._components = []
  }
  /**
  * Data can be set separately into every chart so every chart can have different data.
  */
  setData (data, dataConfig = {}, chartId) {
    chartId = chartId || 'default'
    // Set data to the given chart if it exists.
    if (this._charts[chartId]) this._charts[chartId].setData(data, dataConfig)
  }
  /**
  * Sets the config for all charts that can be part of this parent chart.
  * This config needs to be set before setData because when setting data we need the sub chart to be already defined in order to set data into it.
  */
  setConfig (config) {
    this._config = config
    // Initialize parent handlers
    this._initHandlers()
    // Initialize child charts
    this._initCharts()
    // Initialize parent components
    this._initComponents()
  }

  _initHandlers () {
    _.each(this._config.handlers, (handler) => {
      this._registerHandler(handler.type, handler.config)
    })
  }

  _registerHandler (type, config) {
    if (!this._isEnabledHandler(type)) return false
    // Todo create handlers array similar to components.
    if (type === 'dataProvider') {
      // Set dataProvider config. Eg. input data formatter config
      this._dataProvider.set(config, { silent: true })
      // Since we're setting the config, trigger a change to parentDataModel to re-compute based on new config.
      // Triggering the change on parentModel triggers prepareData on all the dataProvider instances of same parentModel.
      // Todo check if we really need to trigger this or simply call prepareData in current dataProvider?
      this._dataProvider.getParentModel().trigger('change')
    }
  }
  /**
   * Initialize child chart views.
   */
  _initCharts () {
    // Iterate through the this._config.charts array, initialize the given charts, set their config.
    _.each(this._config.charts, (chart) => {
      this._registerChart(chart)
    })
  }

  _registerChart (chart) {
    if (chart.chartId) {
      if (!this._charts[chart.chartId]) {
        this._charts[chart.chartId] = new charts[chart.type]()
      }
      this._charts[chart.chartId].setConfig(chart)
    }
  }

  _initComponents () {
    _.each(this._config.components, (component) => {
      this._registerComponent(component.type, component.config, this._dataProvider, component.id)
    })
    if (this._isEnabledComponent('navigation')) {
      const dataModel = this.getComponentByType('navigation').focusDataProvider
      if (this._isEnabledComponent('compositeY')) this.getComponentByType('compositeY').changeModel(dataModel)
    }
  }

  _registerComponent (type, config, model, id) {
    if (!this._isEnabledComponent(type)) return false
    const configModel = new components[type].ConfigModel(config)
    const viewOptions = _.extend(config, {
      id: id,
      config: configModel,
      model: model,
      eventObject: this._eventObject
    })
    const component = new components[type].View(viewOptions)
    this._components.push(component)

    return component
  }

  _isEnabled (config, type) {
    const foundConfig = _.find(config, {type: type})
    if (!foundConfig) return false
    if (_.isObject(foundConfig.config)) {
      return !(foundConfig.config.enable === false)
    }
    return false
  }

  _isEnabledComponent (type) {
    return this._isEnabled(this._config.components, type)
  }

  _isEnabledHandler (type) {
    return this._isEnabled(this._config.handlers, type)
  }

  render () {
    _.each(this._charts, (chart) => {
      chart.render()
    })
    _.each(this._components, (component) => {
      component.render()
    })
  }
}

module.exports = ChartView
