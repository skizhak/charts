/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
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
    // Container to render into
    this._container = options.container
    this._eventObject = options.eventObject || _.extend({}, Events)
    this.params = {}
  }

  get id () {
    return this._id || this.cid
  }
  /**
   * @returns {d3 selection} svg container to render this.el into if component's element is vector graphics
   */
  get svg () {
    const selector = this.config.get('isSharedContainer') ? 'svg.shared-svg' : `#${this.id}-wrapper svg`
    return this.container.select(selector)
  }
  /**
   * @return {d3 selection} container to render into
   */
  get container () {
    return d3.select(this._container)
  }
  /**
   * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
   * The view may modify the params object with calculated values.
   */
  resetParams () {
    this.params = this.config.computeParams()
  }
  /**
  * This is how the view gets its data.
  */
  getData () {
    return this.model.getData()
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
      if (!this.config.get('isSharedContainer')) {
        const wrapper = document.createElement('div')
        wrapper.setAttribute('id', `${this.id}-wrapper`)
        this._insertSorted(wrapper)
      }
      this._initSvg()
      if (this.svg.select(`.${this.id}`).empty()) {
        this.svg.node().append(this.el)
      }
    } else {
      if (content) this.$el.html(content)
      this._insertSorted(this.el)
    }
  }

  get _wrapper () {
    return this.container.select(`#${this.id}-wrapper`)
  }
  /**
   * First component which uses shared svg container appends svg element to container
   */
  _initSvg () {
    const isSharedContainer = this.config.get('isSharedContainer')
    if (this.svg.empty()) {
      const containerOfSvg = isSharedContainer ? this.container : this._wrapper
      containerOfSvg
        .append('svg')
        .classed('coCharts-svg', true)
        .classed('shared-svg', isSharedContainer)
    }
    this.svg
      .attr('width', this.params.chartWidth || this.svg.attr('width'))
      .attr('height', this.params.chartHeight || this.svg.attr('height'))

    if (isSharedContainer && this.params.isPrimary) this.svg.attr('data-order', this.config.get('order'))
  }
  /**
   * insert own element into the DOM in the right order
   */
  _insertSorted (el) {
    // do nothing if element exists
    if ($.contains(document.documentElement, el)) return

    if (!this.config.get('isSharedContainer') || this.params.isPrimary) {
      el.dataset['order'] = this.config.get('order')
    }
    if (this._container.innerHTML === '') {
      this.container.append(() => el)
    } else {
      const siblings = this._container.children
      _.each(siblings, (sibling) => {
        if (this.config.get('order') < sibling.dataset['order']) {
          $(el).insertBefore(sibling)
          return false
        }
        if (_.last(siblings) === sibling) $(el).insertAfter(sibling)
      })
    }
  }
}

module.exports = ContrailChartsView
