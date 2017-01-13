/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const Backbone = require('backbone')
const d3 = require('d3')

class ContrailView extends Backbone.View {
  constructor (options) {
    super(options)
    this.d3 = d3.select(this.el)
  }

  setElement (el) {
    super.setElement(el)
    this.d3 = d3.select(el)
  }

  d3SetElement (d3El) {
    super.setElement(d3El.node())
    this.d3 = d3El
  }
}

module.exports = ContrailView
