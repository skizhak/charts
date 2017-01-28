/**
 * Selection object for dataframes
 */
const _ = require('lodash')
const d3 = require('d3')
const Events = require('contrail-charts-events')

class Selection {
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
   * @return {Array} [min, max] extent of values of the serie
   */
  getRangeFor (key) {
    if (!_.has(this._ranges, key)) this._ranges[key] = d3.extent(this.data, d => d[key])
    return this._ranges[key]
  }
}
_.extend(Selection.prototype, Events)

module.exports = Selection
