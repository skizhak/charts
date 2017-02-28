/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsDataModel from 'contrail-charts-data-model'
import ContrailChartsView from 'contrail-charts-view'
import * as Charts from 'charts/index'
import * as Components from 'components/index'
import * as Handlers from 'handlers/index'
import actionman from '../../plugins/Actionman'
import Freeze from 'actions/Freeze'
import Unfreeze from 'actions/Unfreeze'

const Actions = {Freeze, Unfreeze}

export default class ChartView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.initialize()
  }
  initialize () {
    this._charts = {}
    this._dataModel = new ContrailChartsDataModel()
    this._dataProvider = new Handlers.DataProvider({ parentDataModel: this._dataModel })
    this._components = []
  }
  /**
  * Data can be set separately into every chart so every chart can have different data.
  */
  setData (data, id = 'default') {
    if (this._frozen) return
    // Set data to the given chart if it exists.
    if (this._charts[id]) {
      this._charts[id].setData(data)
    } else {
      if (_.isArray(data)) this._dataModel.data = data
    }
  }
  /**
  * Sets the config for all charts that can be part of this parent chart.
  * This config needs to be set before setData because when setting data we need the sub chart to be already defined in order to set data into it.
  */
  setConfig (config) {
    if (this._config) this.reset()
    this._config = config
    /**
     * Let's register actions here.
     * Doing this in the constructor causes actions to be registered for views which may not have setConfig invoked,
     * causing multiple chart instance scenarios having actions bound to registars not active in the dom.
     * Since action is singleton and some actions trigger on all registrar, we need to avoid above mentioned scenario.
     */
    _.each(Actions, action => actionman.set(action, this))
    this.setElement(`#${config.id}`)
    // Initialize parent components
    this._initComponents()
    // Initialize child charts
    this._initCharts()
  }
  getComponent (id) {
    return _.find(this._components, {id: id})
  }

  getChart (id) {
    return this._charts[id]
  }
  /**
   * Get array of components by type
   * @return {Array}
   */
  getComponentsByType (type) {
    return _.filter(this._components, {type: type})
  }

  render () {
    _.each(this._charts, chart => {
      chart.render()
    })
    _.each(this._components, component => {
      component.render()
    })
  }

  reset () {
    this.remove()
    this.initialize()
  }

  remove () {
    _.each(Actions, action => actionman.unset(action, this))
    _.each(this._charts, chart => chart.remove())
    this._charts = {}
    this._dataModel = undefined
    this._dataProvider = undefined
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
}
