/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import Events from 'contrail-events'

// Selection object for dataframes
export default class Selection {
  constructor (data = []) {
    this._data = data
    this._ranges = {}
  }

  get data () {
    return this._selectedData || this._data
  }

  set data (data) {
    this._data = data || []
  }
  /**
   * TODO do not trigger change if range doesn't actually change selection
   * Filter out dataframes which have no provided key or its value is not within provided range
   * @param {String} key - serie accessor to filter dataframes by
   * @param {Array} range - [min, max] values of a serie
   */
  filter (key, range) {
    this._ranges = {key: range}
    this._selectedData = _.filter(this._data, d => {
      return _.has(d, key) && d[key] >= range[0] && d[key] <= range[1]
    })
    this.trigger('change')
  }
  /**
   * Calculate and cache range of a serie
   * @param {String} key - serie accessor
   * @param {Boolean} isFull if true get range of the whole data, not just selection
   * @return {Array} [min, max] extent of values of the serie
   */
  getRangeFor (key, isFull) {
    if (isFull) return d3Array.extent(this._data, d => d[key])

    if (!_.has(this._ranges, key)) {
      this._ranges[key] = d3Array.extent(this.data, d => d[key])
    }
    return this._ranges[key]
  }
  /**
   * @return {Array} [min, max] values of provided series values combined
   */
  combineDomains (accessors) {
    const domains = _.map(accessors, accessor => {
      return this.getRangeFor(accessor)
    })
    return d3Array.extent(_.concat(...domains))
  }
}
_.extend(Selection.prototype, Events)
