/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
require('./message.scss')
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./message.html')
const _actions = [
  require('./actions/SendMessage'),
  require('./actions/ClearMessage'),
]

class MessageView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.render()
    _.each(_actions, action => this._actionman.set(action, this))
  }

  get selectors () {
    return _.extend(super.selectors, {
      message: {
        default: 'msg-default',
        info: 'msg-info',
        error: 'msg-error',
      },
      icon: {
        default: 'fa-comment-o',
        info: 'fa-info-circle',
        error: 'fa-exclamation-triangle',
      }
    })
  }

  show (data) {
    let msgObj = _.assignIn({
      componentId: 'default',
      action: 'update',  // 'new', 'once', 'update'. future: 'dismiss', 'block'
      messages: [],
    }, data)
    let template = this.config.get('template') || _template

    if (msgObj.action === 'update') {
      // update message so remove any previous messages from this component
      this.clear(msgObj.componentId)
    }
    _.forEach(msgObj.messages, (msg) => {
      _.assignIn(msg, {
        level: msg.level || 'default',
        iconLevel: this.selectors.icon[msg.level || 'default'],
        msgLevel: this.selectors.message[msg.level || 'default'],
      })
    })

    this.$el.html(template(msgObj))

    this.d3.selectAll('[data-action="once"')
      .style('opacity', 1)
      .transition()
      .duration(5000)
      .style('opacity', 1e-06)
      .remove()
  }

  clear (componentId) {
    const messageSelector = `.message-row[data-component-id="${componentId}"]`
    this.$(messageSelector).fadeOut('fast', () => {
      this.$(messageSelector).remove()
    })
  }
}

module.exports = MessageView
