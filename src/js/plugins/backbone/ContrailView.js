/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/**
 * Extending Backbone View
 */
const _ = require('lodash')
const Backbone = require('backbone')
const $ = require('jquery')
const d3 = require('d3')

d3.selection.prototype.delegate = function (eventName, targetSelector, handler) {
  function delegated () {
    // TODO use jquery.closest d3 alternative here
    // as native closest is not supported in IE15
    const eventTarget = $(d3.event.target).closest(targetSelector)[0]
    if (eventTarget) handler.call(eventTarget, eventTarget.__data__, eventTarget, d3.event)
  }
  return this.on(eventName, delegated)
}

class ContrailView extends Backbone.View {
  /**
   * @return {String} this class name without 'View'
   */
  get type () {
    return this.constructor.name.slice(0, -4)
  }
  get delegateEventSplitter () { return /^(\S+)\s*(.*)$/ }

  // TODO move this function to Utils?
  // instanceof SVGElement works for existing element
  isTagNameSvg (tagName) {
    return _.includes(['g'], tagName)
  }

  delegateEvents (events) {
    events || (events = _.result(this, 'events'))
    if (!events) return this
    this.undelegateEvents()
    for (let key in events) {
      let method = events[key]
      if (!_.isFunction(method)) method = this[method]
      if (!method) continue
      const match = key.match(this.delegateEventSplitter)
      this.delegate(match[1], match[2], method.bind(this))
    }
    return this
  }
  /**
   * Replace jquery with d3
   * d3 doesn't support multiple listeners on the same event and element,
   * so add listener name to create event namespace
   */
  delegate (eventName, selector, listener) {
    const listenerName = listener.name.split(' ')[1]
    this.d3.delegate(`${eventName}.${listenerName}.delegateEvents${this.cid}`, selector, listener)
    return this
  }
  // d3 doesn't support two levels of event namespace
  // TODO undelegate one by one
  undelegateEvents () {
    // if (this.d3) this.d3.on('.delegateEvents' + this.cid, null)
    return this
  }

  undelegate (eventName, selector, listener) {
    const listenerName = listener.name.split(' ')[1]
    this.d3.on(`${eventName}.${listenerName}.delegateEvents${this.cid}`, null)
    return this
  }
  /**
   * svg elements are xml and require namespace to be specified
   */
  _createElement (tagName) {
    if (this.isTagNameSvg(tagName)) {
      return document.createElementNS('http://www.w3.org/2000/svg', tagName)
    } else return super._createElement(tagName)
  }
  /**
   * d3 selection shortcut for view element
   */
  _setElement (el) {
    super._setElement(el)
    this.d3 = d3.select(el)
  }
}

module.exports = ContrailView
