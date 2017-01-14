/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/**
 * Extending Backbone View
 */
const _ = require('lodash')
const Backbone = require('backbone')
const d3Selection = require('d3-selection')

class ContrailView extends Backbone.View {
  /**
   * svg elements are xml and require namespace to be specified
   */
  _createElement (tagName) {
    if (_.includes(['g'], tagName)) {
      return document.createElementNS('http://www.w3.org/2000/svg', tagName)
    } else return super._createElement(tagName)
  }
  /**
   * d3 selection shortcut for view element
   */
  _setElement (el) {
    super._setElement(el)
    this.d3 = d3Selection.select(el)
  }
}

module.exports = ContrailView
