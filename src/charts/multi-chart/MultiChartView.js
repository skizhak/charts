/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsDataModel from 'contrail-charts-data-model'
import ContrailChartsView from 'contrail-charts-view'
import * as Charts from 'charts/index'
import * as Components from 'components/index'
import * as Handlers from 'handlers/index'
import Actionman from '../../plugins/Actionman'
import Freeze from 'actions/Freeze'
import Unfreeze from 'actions/Unfreeze'
const _actions = {Freeze, Unfreeze}

export default class ChartView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._charts = {}
    this._dataModel = new ContrailChartsDataModel()
    this._dataProvider = new Handlers.DataProvider({ parentDataModel: this._dataModel })
    this._components = []
    this._actionman = new Actionman()
    _.each(_actions, action => this._actionman.set(action, this))
  }
  /**
  * Data can be set separately into every chart so every chart can have different data.
  */
  setData (data, dataConfig = {}, id = 'default') {
    if (this._frozen) return
    // Set data to the given chart if it exists.
    if (this._charts[id]) {
      this._charts[id].setData(data, dataConfig)
    } else {
      if (dataConfig) this.setDataConfig(dataConfig)
      if (_.isArray(data)) this._dataModel.data = data
    }
  }
  /**
   * Set ContrailChartsDataModel config
   * @param dataConfig
   */
  setDataConfig (dataConfig = {}) {
    this._dataModel.set(dataConfig, { silent: true })
  }
  /**
  * Sets the config for all charts that can be part of this parent chart.
  * This config needs to be set before setData because when setting data we need the sub chart to be already defined in order to set data into it.
  */
  setConfig (config) {
    this._config = config
    this.setElement(`#${config.id}`)
    // Initialize parent components
    this._initComponents()
    // Initialize child charts
    this._initCharts()
  }
  /**
   * Get array of components by type
   * @return {Array}
   */
  getComponentsByType (type) {
    return _.filter(this._components, {type: type})
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
      this._dataProvider.parentModel.trigger('change')
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
    if (chart.id) {
      if (!this._charts[chart.id]) {
        this._charts[chart.id] = new Charts[chart.type + 'View']()
      }
      this._charts[chart.id].setConfig(chart)
    }
  }
  /**
   * Initialize configured components
   */
  _initComponents () {
    _.each(this._config.components, (component, index) => {
      component.config.order = index
      component.config.id = component.id
      this._registerComponent(component.type, component.config, this._dataProvider, component.id)
    })

    // Post init configuration of components dependant on others

    _.each(this._components, (component, index) => {
      const sourceComponentId = component.config.get('sourceComponent')
      if (sourceComponentId) {
        const sourceComponent = this.getComponent(sourceComponentId)
        component.config.parent = sourceComponent.config
      }
      if (this._isEnabledComponent('Tooltip')) {
        component.config.toggleComponent('Tooltip', true)
      }
      if (this._isEnabledComponent('Crosshair')) {
        component.config.toggleComponent('Crosshair', true)
      }
    })
  }
  /**
   * Initialize individual component by type, given config, data model and id
   * @param {String} type
   * @param {Object} config
   * @param {String} id optional
   */
  _registerComponent (type, config, model, id) {
    if (!this._isEnabledComponent(type)) return false
    let configModel
    if (Components[`${type}ConfigModel`]) {
      configModel = new Components[`${type}ConfigModel`](config)
    }
    const viewOptions = _.extend({}, config, {
      id: id,
      config: configModel,
      model: model,
      container: this.el,
      // actionman is passed as parameter to each component for it to be able to register action
      actionman: this._actionman,
    })
    const component = new Components[`${type}View`](viewOptions)
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
