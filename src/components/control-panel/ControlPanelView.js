/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./control-panel.scss')
import _ from 'lodash'
import 'd3'
import ContrailChartsView from 'contrail-charts-view'
import _template from './control-panel.html'
import _panelTemplate from './panel.html'
import _actionTemplate from './action.html'

export default class ControlPanelView extends ContrailChartsView {
  constructor (p = {}) {
    super(p)
    super.render(_template())
    this._opened = false
    this.render()
    this.listenTo(this.config, 'change', this.render)
  }

  get selectors () {
    return _.extend({}, super.selectors, {
      panel: '.panel',
      menuItem: '.control-panel-item',
      menuItems: '.control-panel-items',
      container: '.control-panel-expanded-container',
    })
  }

  get events () {
    return {
      [`click ${this.selectors.menuItem}`]: '_onMenuItemClick',
    }
  }

  render () {
    const configs = _.map(this.config.get('menu'), config => {
      return _.extend({}, config, this.config.menuItems[config.id])
    })
    const menuItems = this.d3.select(this.selectors.menuItems).selectAll(this.selectors.menuItem)
      .data(configs, config => config.id)
      .classed('disabled', d => d.disabled)
    menuItems
      .enter()
      .append('div')
      .classed(this.selectorClass('menuItem'), true)
      .classed('disabled', d => d.disabled)
      .html(d => _actionTemplate(d))
    menuItems.exit()
      .remove()
  }

  addMenuItem (config) {
    this.config.set(this.config.get('menu').push(config))
  }

  removeMenuItem (id) {
    this.el.querySelector(`[data-id="${id}"]`).remove()
  }

  enableMenuItem (id) {
  }

  disableMenuItem (id) {
  }

  open (config) {
    const panel = this.el.querySelector(this.selectors.panel)
    panel.innerHTML = _panelTemplate(config)
    const container = panel.querySelector(this.selectors.container)
    panel.classList.toggle('hide')
    const actionId = this._opened ? 'HideComponent' : 'ShowComponent'
    this._opened = !this._opened
    this._actionman.fire(actionId, config.component, container)
  }

  // Event handlers

  _onMenuItemClick (d, el) {
    d3.event.stopPropagation()
    if (d.component) this.open(d)
    else this._actionman.fire(d.id, d)
  }
}
