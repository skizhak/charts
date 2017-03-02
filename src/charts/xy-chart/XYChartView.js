/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsView from 'contrail-charts-view'
import * as Components from 'components/index'
import DataProvider from 'handlers/DataProvider'
import actionman from '../../plugins/Actionman'

import ShowComponent from 'actions/ShowComponent'
import HideComponent from 'actions/HideComponent'
import SelectSerie from 'actions/SelectSerie'
import SelectColor from 'actions/SelectColor'
import SelectChartType from 'actions/SelectChartType'
import Zoom from 'actions/Zoom'
import Refresh from 'actions/Refresh'
import Freeze from 'actions/Freeze'
import Unfreeze from 'actions/Unfreeze'
const Actions = {ShowComponent, HideComponent, SelectSerie, SelectColor, SelectChartType, Zoom, Refresh, Freeze, Unfreeze}
/**
* Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
* Many different Y axis may be configured.
*/
export default class XYChartView extends ContrailChartsView {

  constructor (p) {
    super(p)
    this._dataProvider = new DataProvider()
    this._components = []
  }
  /**
  * Provide data for this chart as a simple array of objects.
  * Additional ContrailChartsDataModel configuration may be provided.
  * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
  */
  setData (data) {
    if (this._frozen) return
    if (_.isArray(data)) this._dataProvider.data = data
  }

  get provider () {
    return this._dataProvider
  }
  /**
   * Sets the configuration for this chart as a simple object.
   * Instantiate the required views if they do not exist yet, set their configurations otherwise.
   * Updating configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
   * calling setConfig on already rendered chart will reset the chart.
   */
  setConfig (config) {
    if (this._config) this.remove()
    this._config = _.cloneDeep(config)
    this.setElement(`#${config.id}`)
    // Todo Fix chart init similar to that of component. use the render via ContrailChartsView instead
    this._container = this.el.parentElement
    this.el.classList.add(this.selectors.chart.substr(1))
    /**
     * Let's register actions here.
     * Doing this in the constructor causes actions to be registered for views which may not have setConfig invoked,
     * causing multiple chart instance scenarios having actions bound to registars not active in the dom.
     * Since action is singleton and some actions trigger on all registrar, we need to avoid above mentioned scenario.
     */
    _.each(Actions, action => actionman.set(action, this))
    if (_.has(config, 'dataProvider.config')) this._dataProvider.config = config.dataProvider.config
    this._initComponents()
  }
  /**
   * Get component by id
   * @param {String} id
   */
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

  render () {
    _.each(this._components, (component) => {
      component.render()
    })
  }
  /**
   * Removes chart view and its components.
   * All actions will be unregistered, individual components will be removed except the parent container.
   */
  remove () {
    _.each(Actions, action => actionman.unset(action, this))
    _.each(this._components, component => component.remove())
    this._components = []
  }

  renderMessage (msgObj) {
    actionman.fire('SendMessage', msgObj)
  }

  clearMessage (componentId) {
    // To clear messages for a given component we send a message with 'update' action and an empty array of messages.
    const msgObj = {
      componentId: componentId,
      action: 'update',
      messages: [],
    }
    actionman.fire('ClearMessage', msgObj)
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
    // Set title to parent title only if it doesn't exist. Each component may be handling title in different way.
    if (!config.title) config.title = this._config.title
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
