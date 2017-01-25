/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const $ = require('jquery')
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./control-panel.html')
const _panelTemplate = require('./panel.html')
const _actionTemplate = require('./action.html')
const _menuItems = {
  Refresh: {
    title: 'Refresh chart',
    icon: 'fa fa-refresh',
  },
  ColorPicker: {
    title: 'Select color for serie',
    icon: 'fa fa-eyedropper',
  },
  Filter: {
    title: 'Select serie to show',
    icon: 'fa fa-filter',
  }
}

class ControlPanelView extends ContrailChartsView {
  get className () { return 'coCharts-control-panel' }
  get events () {
    return {
      'click .control-panel-item': '_onMenuItemClick',
    }
  }
  get selectors () {
    return _.extend({}, super.selectors, {
      panel: '.panel',
      menuItem: '.control-panel-item',
      menuItems: '.control-panel-items',
      container: '.control-panel-expanded-container',
    })
  }

  constructor (p = {}) {
    super(p)
    super.render(_template())
    this._opened = false
    this.render()
    this.listenTo(this.config, 'change', this.render)
  }

  render () {
    const configs = _.map(this.config.get('menu'), config => _.extend({}, config, _menuItems[config.id]))
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
    $(panel).toggle()
    const actionId = this._opened ? 'HideComponent' : 'ShowComponent'
    this._opened = !this._opened
    this._actionman.fire(actionId, config.component, container)
  }

  _onMenuItemClick (d, el) {
    d3.event.stopPropagation()
    if (d.component) this.open(d)
    else this._actionman.fire(d.id, d)
  }
}

module.exports = ControlPanelView
