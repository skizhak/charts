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
  // TODO move this function to Utils?
  // instanceof SVGElement works for existing element
  isTagNameSvg (tagName) {
    return _.includes(['g'], tagName)
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
    this.d3 = d3Selection.select(el)
  }
}

module.exports = ContrailView
