/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const $ = require('jquery')
const ContrailChartsDataModel = require('contrail-charts-data-model')
const ContrailChartsView = require('contrail-charts-view')
const components = require('components/index')
const handlers = require('handlers/index')
const Actionman = require('../../plugins/Actionman')
const _actions = [require('actions/SelectSerie')
]
/**
* Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
* Many different Y axis may be configured.
*/
class XYChartView extends ContrailChartsView {
  get type () { return 'XYChartView' }

  constructor (options) {
    super(options)
    this.hasExternalBindingHandler = false
    this._dataModel = new ContrailChartsDataModel()
    this._dataProvider = new handlers.DataProvider({ parentDataModel: this._dataModel })
    this._components = []
    options = options || {}
    this._actionman = new Actionman()

    this._actions = _actions
    // register common actions
    setTimeout(() => {
      _.each(this._actions, action => this._actionman.set(action, this))
    })
  }
  /**
  * Provide data for this chart as a simple array of objects.
  * Additional ContrailChartsDataModel configuration may be provided.
  * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
  */
  setData (data, dataConfig) {
    if (dataConfig) this.setDataConfig(dataConfig)
    if (_.isArray(data)) this._dataModel.setData(data)
  }
  // Todo deprecate setDataConfig. DataModel parser will be set as input parser in dataProvider config.
  /**
   * Set ContrailChartsDataModel config
   * @param dataConfig
   */
  setDataConfig (dataConfig) {
    dataConfig = dataConfig || {}
    this._dataModel.set(dataConfig, { silent: true })
  }
  /**
  * Provides a global BindingHandler to this chart.
  * If no BindingHandler is provided it will be instantiated by this chart if needed based on its local configuration.
  */
  setBindingHandler (bindingHandler) {
    this.hasExternalBindingHandler = (bindingHandler != null)
    this.bindingHandler = bindingHandler
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
      this._config.chartId = 'XYChartView'
    }
    // Todo make dataConfig part of handlers? as dataProvider
    if (this._config.dataConfig) this.setDataConfig(this._config.dataConfig)
    this._initHandlers()
    this._initComponents()
  }

  getComponent (id) {
    return _.find(this._components, {id: id})
  }

  getComponentByType (type) {
    return _.find(this._components, {type: type})
  }

  _initHandlers () {
    _.each(this._config.handlers, (handler) => {
      this._registerHandler(handler.type, handler.config)
    })
  }

  _registerHandler (type, config) {
    if (!this._isEnabledHandler(type)) return false
    // Todo create handlers array similar to components.
    if (type === 'bindingHandler') {
      if (!this.bindingHandler) {
        this.bindingHandler = new handlers.BindingHandler(config)
      } else {
        this.bindingHandler.addBindings(config.bindings, this._config.chartId)
      }
    }
    if (type === 'dataProvider') {
      // Set dataProvider config. Eg. input data formatter config
      this._dataProvider.set(config, { silent: true })
      // Since we're setting the config, trigger a change to parentDataModel to re-compute based on new config.
      // Triggering the change on parentModel triggers prepareData on all the dataProvider instances of same parentModel.
      // Todo check if we really need to trigger this or simply call prepareData in current dataProvider?
      this._dataProvider.getParentModel().trigger('change')
    }
  }

  _initComponents () {
    let dataModel
    _.each(this._config.components, (component, index) => {
      component.config.order = index
      this._registerComponent(component.type, component.config, this._dataProvider, component.id)
    })
    // set parent config model
    _.each(this._components, (component, index) => {
      const sourceComponentId = component.config.get('sourceComponent')
      if (sourceComponentId) {
        const sourceComponent = this.getComponent(sourceComponentId)
        component.config.setParent(sourceComponent.config)
      }
    })
    if (this._isEnabledComponent('navigation')) {
      dataModel = this.getComponentByType('navigation').focusDataProvider
      if (this._isEnabledComponent('compositeY')) this.getComponentByType('compositeY').changeModel(dataModel)
    }
    if (this._isEnabledComponent('timeline')) {
      dataModel = this.getComponentByType('timeline').focusDataProvider
      if (this._isEnabledComponent('compositeY')) this.getComponentByType('compositeY').changeModel(dataModel)
    }
    if (this._isEnabledComponent('tooltip')) {
      if (this._isEnabledComponent('compositeY')) this.getComponentByType('compositeY').config.toggleComponent('tooltip', true)
    }
    if (this._isEnabledComponent('crosshair')) {
      if (this._isEnabledComponent('compositeY')) this.getComponentByType('compositeY').config.toggleComponent('crosshair', true)
    }
    if (this._isEnabledHandler('bindingHandler') && !this.hasExternalBindingHandler) {
      // Only start the binding handler if it is not an external one.
      // Otherwise assume it will be started by the parent chart.
      this.bindingHandler.start()
    }
  }

  _registerComponent (type, config, model, id) {
    if (!this._isEnabledComponent(type)) return false
    let configModel
    if (components[type].ConfigModel) {
      configModel = new components[type].ConfigModel(config)
    }
    const viewOptions = _.extend({}, config, {
      id: id,
      config: configModel,
      model: model,
      eventObject: this._eventObject,
      container: this.el,
      // actionman is passed as parameter to each component for it to be able to register action
      actionman: this._actionman,
    })
    const component = new components[type].View(viewOptions)
    this._components.push(component)

    if (this._isEnabledHandler('bindingHandler') || this.hasExternalBindingHandler) {
      this.bindingHandler.addComponent(this._config.chartId, type, component)
    }
    return component
  }

  renderMessage (msgObj) {
    this._eventObject.trigger('message', msgObj)
  }

  clearMessage (componentId) {
    // To clear messages for a given component we send a message with 'update' action and an empty array of messages.
    const msgObj = {
      componentId: componentId,
      action: 'update',
      messages: []
    }
    this._eventObject.trigger('message', msgObj)
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
    _.each(this._components, (component) => {
      component.render()
    })
    $(this._config.el).html(this.$el)
  }
}

module.exports = XYChartView
