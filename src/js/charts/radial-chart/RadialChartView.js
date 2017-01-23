/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsDataModel = require('contrail-charts-data-model')
const ContrailView = require('contrail-view') // Todo use contrail-charts-view instead?
const components = require('components/index')
const SerieProvider = require('handlers/SerieProvider')
const Actionman = require('../../plugins/Actionman')
const _actions = [
  require('actions/ShowComponent'),
  require('actions/HideComponent'),
  require('actions/SelectColor'),
]
/**
* Group of charts rendered in polar coordinates system
* TODO merge with ChartView as long as XYChart too
*/
class RadialChartView extends ContrailView {
  get type () { return 'RadialChartView' }

  constructor (p = {}) {
    super(p)
    this._dataModel = new ContrailChartsDataModel()
    this._dataProvider = new SerieProvider({ parent: this._dataModel })
    this._components = []
    this._actionman = new Actionman()
    _.each(_actions, action => this._actionman.set(action, this))
  }

  render () {
    _.each(this._components, (component) => {
      component.render()
    })
  }
  /**
  * Provide data for this chart as a simple array of objects.
  * Additional ContrailChartsDataModel configuration may be provided.
  * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
  */
  setData (data, dataConfig) {
    dataConfig = dataConfig || {}
    this._dataModel.set(dataConfig, { silent: true })

    if (_.isArray(data)) this._dataModel.data = data
  }
  /**
  * Sets the configuration for this chart as a simple object.
  * Instantiate the required views if they do not exist yet, set their configurations otherwise.
  * Setting configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
  */
  setConfig (config) {
    this._config = config
    this.setElement(config.container)
    if (!this._config.chartId) {
      this._config.chartId = 'RadialChartView'
    }
    this._initComponents()
  }

  getComponent (id) {
    return _.find(this._components, {id: id})
  }
  /**
   * Get array of components by type
   * @return {Array}
   */
  getComponentsByType (type) {
    return _.filter(this._components, {type: type})
  }

  _initComponents () {
    _.each(this._config.components, (component, index) => {
      component.config.order = index
      this._registerComponent(component.type, component.config, this._dataProvider, component.id)
    })
    // set parent config model
    _.each(this._components, (component, index) => {
      const sourceComponentId = component.config.get('sourceComponent')
      if (sourceComponentId) {
        const sourceComponent = this.getComponent(sourceComponentId)
        component.config.parent = sourceComponent.config
      }
    })
    if (this._isEnabledComponent('pieChart')) {
      _.each(this.getComponentsByType('pieChart'), (pieChart) => pieChart.changeModel(this._dataProvider))
    }
  }

  _registerComponent (type, config, model, id) {
    if (!this._isEnabledComponent(type)) return false
    const configModel = new components[type].ConfigModel(config)
    const viewOptions = _.extend(config, {
      id: id,
      config: configModel,
      model: model,
      actionman: this._actionman,
      container: this.el,
    })
    const component = new components[type].View(viewOptions)
    this._components.push(component)

    return component
  }

  _isEnabledComponent (type) {
    const componentConfig = _.find(this._config.components, {type: type})
    if (!componentConfig) return false
    if (_.isObject(componentConfig.config)) {
      return !(componentConfig.config.enable === false)
    }
    return false
  }
}

module.exports = RadialChartView
