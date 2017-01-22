/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const $ = require('jquery')
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./control-panel.html')
const _actionTemplate = require('./action.html')

class ControlPanelView extends ContrailChartsView {
  get type () { return 'controlPanel' }
  get className () { return 'coCharts-control-panel-view' }
  get events () {
    return {
      'click .control-panel-item': '_onMenuItemClick',
    }
  }
  constructor (p = {}) {
    super(p)

    this.listenTo(this.config, 'change', this.render)

    // TODO control panel will operate not with all actions
    // this may be configured per this component
    const _actions = this._actionman.getAll()
    this.render(_template())

    // add menu items for already registered actions
    _.each(_actions, (action) => {
      this.addMenuItem(action)
    })
    this._actionman.on('add', this.addMenuItem.bind(this))
  }

  addMenuItem (action) {
    action.on('enable', this.enableMenuItem.bind(this, action))
    action.on('disable', this.disableMenuItem.bind(this, action))
    action.on('show', this.addMenuItem.bind(this, action))
    action.on('hide', this.removeMenuItem.bind(this, action))

    this.$('.control-panel-items').append(_actionTemplate(action))
  }

  removeMenuItem (action) {
    const menuItem = this.$(`[data-id="${action.id()}"]`)
    menuItem.remove()
  }

  enableMenuItem (action) {
    const menuItem = this.$(`[data-id="${action.id()}"]`)
    menuItem.addClass('enabled')
  }

  disableMenuItem (action) {
    const menuItem = this.$(`[data-id="${action.id()}"]`)
    menuItem.removeClass('enabled')
  }

  _onMenuItemClick (d, el) {
    d3.event.stopPropagation()
    const data = $(el).data()
    const action = this._actionman.get(data.id)
    action.apply(data)
  }
}

module.exports = ControlPanelView
