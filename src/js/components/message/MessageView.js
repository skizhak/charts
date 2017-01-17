/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./message.html')

class MessageView extends ContrailChartsView {
  get type () { return 'message' }
  get tagName () { return 'div' }
  get className () { return 'coCharts-message-view' }

  constructor (options) {
    super(options)
    this.render()
    this.listenTo(this._eventObject, 'message', this.show)
    this.listenTo(this._eventObject, 'clearMessage', this.clear)
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
        iconLevel: this.config.HTMLClassNames.icon[msg.level || 'default'],
        msgLevel: this.config.HTMLClassNames.message[msg.level || 'default']
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
