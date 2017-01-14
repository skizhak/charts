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
class ContrailChartsView extends ContrailView {
  get defaults () {
    return {
      _type: 'ContrailChartsView',
    }
  }

  constructor (options = {}) {
    super(options)
    this._id = options.id
    this.d3.attr('id', this.id)
    this.config = options.config
    this._order = options.order
    this._container = options.container
    this._eventObject = options.eventObject || _.extend({}, Events)
  }

  get id () {
    return this._id || this.cid
  }

  get d3Container () {
    if (this.isTagNameSvg(this.tagName)) {
      return d3.select(this._container[0]).select('svg')
    } else {
      return d3.select(this._container[0])
    }
  }
  /**
   * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
   * The view may modify the params object with calculated values.
   */
  resetParams () {
    this.params = this.config.initializedComputedParameters()
  }

  resetParamsForChild (childIndex) {
    this.params = this.config.initializedComputedParametersForChild(childIndex)
  }
  /**
  * This is how the view gets its data.
  */
  getData () {
    return this.model.getData()
  }
  /**
   * First component which uses shared svg container appends svg element to container
   */
  _initSvg () {
    if (this.d3Container.empty()) {
      d3.select(this._container[0])
        .append('svg')
        .classed('coCharts-svg', true)
        .classed('shared-svg', true)
    }
    this.d3Container
      .attr('width', this.params.chartWidth || this.d3Container.attr('width'))
      .attr('height', this.params.chartHeight || this.d3Container.attr('height'))
  }
  /**
   * Appends components element to container in the order specified in this._order
   *
   * Components which renders vector graphics should call super.render() firsthand
   * in order to initialize shared svg container if missing and append this.el to it
   * Thus this.element will be ready to animate other entering elements
   *
   * Components rendering html should call super.render() at the end to increase performance by less browser redraw
   * @param {String} content to insert into element's html
   */
  render (content) {
    if (this.isTagNameSvg(this.tagName)) {
      this._initSvg()
      if (this.d3Container.select(`.${this.id}`).empty()) {
        this.d3Container.node().append(this.el)
      }
      return
    }

    if (content) this.$el.html(content)

    // append element to container first time
    if (!_.isEmpty(this._container.find(`#${this.id}`))) return

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
  }
}

module.exports = ContrailChartsView
