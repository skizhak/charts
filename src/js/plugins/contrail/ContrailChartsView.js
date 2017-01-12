/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const Events = require('contrail-charts-events')
const ContrailView = require('contrail-view')
/**
 * View base class.
 */
module.exports = ContrailView.extend({
  defaults: {
    _type: 'ContrailChartsView',
  },

  initialize: function (options) {
    this.id = options.id
    this.config = options.config
    this._order = options.order
    this._container = options.container
    this._eventObject = options.eventObject || _.extend({}, Events)
  },
  /**
   * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
   * The view may modify the params object with calculated values.
   */
  resetParams: function () {
    this.params = this.config.initializedComputedParameters()
  },

  resetParamsForChild: function (childIndex) {
    this.params = this.config.initializedComputedParametersForChild(childIndex)
  },
  /**
  * This is how the view gets its data.
  */
  getData: function () {
    return this.model.getData()
  },
  initContainer: function () {
    let container = this.containerSelection()
    if (container.empty()) { // This will be the shared container case.
      container = d3.select(this._container[0])
        .append('div')
        .classed('coCharts-shared-container', true)
        .attr('data-order', this._order)
    }
    return container
  },
  /**
   * First component which uses shared svg container appends svg element to container
   */
  initSVG: function (sort) {
    let svg = this.svgSelection()
    let container = this.initContainer()
    if (svg.empty()) {
      svg = container.append('svg')
        .classed('coCharts-svg', true)
    }
    if (sort && !_.isNil(this._order)) {
      svg.node().parentNode.dataset['order'] = this._order
      d3.select(this._container[0])
        .selectAll('div > [data-order]')
        .datum(function () { return this.dataset.order })
        .sort()
        .datum(null)
    }
    // Each component adds its class to shared svg to indicate initialized state
    svg.classed(this.className, true)
    return svg
  },
  containerSelection: function () {
    if (this.config.get('isSharedContainer')) {
      return d3.select(this._container[0]).select('.coCharts-shared-container')
    } else {
      return d3.select(this._container[0])
    }
  },
  /**
  * @return Object d3 Selection of svg element shared between components in this container
  */
  svgSelection: function () {
    return this.containerSelection().select('svg')
  },

  render: function (content) {
    if (content) this.$el.html(content)

    // append element to container first time
    const id = _.isUndefined(this.id) ? '' : this.id
    const selector = id ? `#${id}` : `.${this.className}`
    if (!_.isEmpty(this._container.find(selector))) return
    this.$el.addClass(this.className)
    this.el.dataset['order'] = this._order
    if (this._container.is(':empty')) {
      this._container.append(this.$el)
    } else {
      const elements = this._container.children()
      _.each(elements, (el) => {
        if (this._order < el.dataset['order']) {
          this.$el.insertBefore(el)
          return false
        }
        if (_.last(elements) === el) this.$el.insertAfter(el)
      })
    }
  },
})
