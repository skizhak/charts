/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailView from 'contrail-view' // Todo use contrail-charts-view instead
import * as Components from 'components/index'
import SerieProvider from 'handlers/SerieProvider'
import actionman from '../../plugins/Actionman'

import ShowComponent from 'actions/ShowComponent'
import HideComponent from 'actions/HideComponent'
import SelectColor from 'actions/SelectColor'
import SelectSerie from 'actions/SelectSerie'
import Refresh from 'actions/Refresh'
import Freeze from 'actions/Freeze'
import Unfreeze from 'actions/Unfreeze'
const Actions = {ShowComponent, HideComponent, SelectSerie, SelectColor, Refresh, Freeze, Unfreeze}
/**
* Group of charts rendered in polar coordinates system
* TODO merge with XYChart
*/
export default class RadialChartView extends ContrailView {

  constructor (p = {}) {
    super(p)
    this.initialize()
  }

  initialize () {
    this._dataProvider = new SerieProvider()
    this._components = []
  }

  render () {
    _.each(this._components, (component) => {
      component.render()
    })
  }

  reset () {
    this.remove()
    this.initialize()
  }

  remove () {
    if (actionman) _.each(Actions, action => actionman.unset(action, this))
    _.each(this._components, component => component.remove())
    this._dataProvider = undefined
    this._components = []
  }
  /**
  * Provide data for this chart as a simple array of objects.
  * Additional ContrailChartsDataModel configuration may be provided.
  * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
  */
  setData (data) {
    if (_.isArray(data)) this._dataProvider.data = data
  }
  /**
  * Sets the configuration for this chart as a simple object.
  * Instantiate the required views if they do not exist yet, set their configurations otherwise.
  * Setting configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
  */
  setConfig (config) {
    if (this._config) this.reset()
    this._config = config
    this.setElement(`#${config.id}`)
    this._container = this.el.parentElement
    // Todo use class from selectors. extend ContrailChartsView instead of ContrailView
    // streamline chart class. xy uses cc-chart. position relative mess with tooltip position
    this.el.classList.add('cc-chart')
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
    // Set title to parent title only if it doesn't exist. Each component may be handling title in different way.
    if (!config.title) config.title = this._config.title
    const configModel = new Components[`${type}ConfigModel`](config)
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

  _isEnabledComponent (type) {
    const componentConfig = _.find(this._config.components, {type: type})
    if (!componentConfig) return false
    if (_.isObject(componentConfig.config)) {
      return !(componentConfig.config.enable === false)
    }
    return false
  }
}
