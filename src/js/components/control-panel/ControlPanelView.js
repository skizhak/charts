/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const _ = require('underscore')
const Events = require('contrail-charts-events')
const ContrailChartsView = require('contrail-charts-view')

const _template = require('./control-panel.html')
const _actionTemplate = require('./action.html')

class Self extends ContrailChartsView.extend({
  type: 'controlPanel',
  className: 'coCharts-control-panel-view',
  events: {
    'click .control-panel-item': '_onMenuItemClick',
  },
}) {
  constructor (options = {}) {
    super(options)

    this.listenTo(this.config, 'change', this.render)
    this.eventObject = options.eventObject || _.extend({}, Events)

    // TODO control panel will operate not with all actions
    // this may be configured per this component
    const _actions = this._actionman.getAll()
    this.$el.html(_template())

    // add menu items for already registered actions
    _.each(_actions, (action) => {
      this.addMenuItem(action)
    })
    this._actionman.on('add', this.addMenuItem.bind(this))
  }

  render () {
    this.$el.addClass(this.className)
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

  _onMenuItemClick (e) {
    e.stopPropagation()
    const data = $(e.currentTarget).data()
    const action = this._actionman.get(data.id)
    action.apply(data)
  }
}

module.exports = Self
