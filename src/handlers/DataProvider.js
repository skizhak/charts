/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const ContrailModel = require('contrail-model')
const ContrailEvents = require('contrail-events')
/**
 * A DataModel wrapper for view components.
 * Handles:
 * - data range calculation for view components
 * - data filtering and chaining between components
 */
class DataProvider extends ContrailModel {
  get defaults () {
    return {
      // The formatted/filtered data
      data: [],

      // Function to format/filter data. Always applied on parentData
      formatData: undefined,

      // A lazy store of data ranges for which a range was calculated or for which the range was set manually.
      // example: { x: [0, 100], y: [20, 30], r: [5, 20] }
      range: {},

      // Ranges set manually on this data provider.
      manualRange: {},

      // This can be a DataModel or another DataProvider.
      parentDataModel: undefined,

      error: false,

      // List or error objects with level and error message
      errorList: [],

      messageEvent: _.extend({}, ContrailEvents)
    }
  }

  constructor (options) {
    super(options)
    this.prepareData()
    // Listen for changes in the parent model.
    if (this.hasParentModel()) {
      this.listenTo(this.parentModel, 'change', this.prepareData)
    }
    this.listenTo(this, 'change:error', this.triggerError)
  }

  get type () {
    return 'Data'
  }
  get parentModel () {
    return this.get('parentDataModel')
  }

  get data () {
    return this.get('data')
  }

  set data (data) {
    this.set({data: data})
  }

  get parentData () {
    let data = []
    if (this.hasParentModel()) {
      data = this.parentModel.data
    }
    return data
  }

  get queryLimit () {
    let queryLimit
    if (this.hasParentModel() && _.isFunction(this.parentModel.getQueryLimit)) {
      queryLimit = this.parentModel.getQueryLimit()
    } else {
      queryLimit = {}
    }
    return queryLimit
  }
  /**
   * Sets queryLimit to a parent. In practice this will iterate down to the DataModel and should cause a data re-fetch with new limits.
   */
  set queryLimit (queryLimit) {
    if (this.hasParentModel()) {
      this.parentModel.queryLimit = queryLimit
    }
    const range = this.range
    _.each(queryLimit, (queryRange, key) => {
      delete range[key]
    })
  }

  get range () {
    return this.get('range')
  }

  set range (range) {
    this.set({range: range})
  }

  get manualRange () {
    return this.get('manualRange')
  }

  hasParentModel () {
    return this.has('parentDataModel')
  }

  getRangeFor (constiableName) {
    if (_.isEmpty(this.data)) return []
    const range = this.range
    if (!_.has(range, constiableName)) {
      range[constiableName] = this.calculateRangeForDataAndVariableName(this.data, constiableName)
    }
    return range[constiableName]
  }

  getParentRange () {
    let parentRange = {}
    if (this.hasParentModel()) {
      parentRange = this.parentModel.range
    }
    return parentRange
  }
  /**
   * Sets the ranges and manual ranges for the constiables provided in the newRange object.
   * Example: setRangeFor( { x: [0,100], y: [5,10] } )
   */
  setRangeFor (newRange) {
    const range = _.extend({}, this.range)
    const manualRange = _.extend({}, this.manualRange)
    _.each(newRange, (constiableRange, constiableName) => {
      range[constiableName] = constiableRange
      manualRange[constiableName] = constiableRange
    })
    this.setRanges(range, manualRange)
  }

  resetRangeFor (newRange) {
    const range = _.extend({}, this.range)
    const manualRange = _.extend({}, this.get('manualRange'))
    _.each(newRange, (constiableRange, constiableName) => {
      delete range[constiableName]
      delete manualRange[constiableName]
    })
    this.setRanges(range, manualRange)
  }

  resetAllRanges () {
    this.setRanges({}, {})
  }
  /**
   * Worker function used to calculate a data range for provided constaible name.
   */
  calculateRangeForDataAndVariableName (data, constiableName) {
    let constiableRange
    const manualRange = this.get('manualRange')
    if (_.isArray(manualRange[constiableName])) {
      // Use manually set range if available.
      constiableRange = [manualRange[constiableName][0], manualRange[constiableName][1]]
    } else {
      // Otherwise calculate the range from data.
      if (data.length) {
        constiableRange = d3.extent(data, (d) => d[constiableName])
      } else {
        // No data available so assume a [0..1] range.
        constiableRange = [0, 1]
      }
    }
    return constiableRange
  }
  /**
   * Utility function to filter data by inclusion of dataframe inside provided ranges
   * @param {Object[]} data
   * @param {Object} ranges
   * @param {Object[]} ranges.keys
   */
  filterByRanges (data, ranges) {
    return _.filter(data, d => {
      let pass = true
      let i = 0
      const keys = ranges.keys()
      while (pass && i < keys.length) {
        const key = keys[i]
        pass = _.has(d, key) && d[key] >= ranges[key][0] && d[key] <= ranges[key][1]
        i++
      }
    })
  }

  setRanges (range, manualRange) {
    let data = this.data
    const formatData = this.get('formatData')
    if (!manualRange) {
      manualRange = this.get('manualRange')
    }
    if (_.isFunction(formatData)) {
      data = formatData(data, manualRange)
    }
    this.set({data, range, manualRange})
  }
  /**
   * Take the parent's data and filter / format it.
   * Called on initialization and when parent data changed.
   */
  prepareData () {
    let data = this.parentData
    if (_.isEmpty(data)) return
    const formatData = this.get('formatData')
    if (_.isFunction(formatData)) {
      data = formatData(data)
    }
    this.attributes.data = data
    this.trigger('change', this)
  }

  triggerError () {
    if (this.error) {
      this.messageEvent.trigger('error', {type: this.type, action: 'show', messages: this.errorList})
    } else {
      this.messageEvent.trigger('error', {type: this.type, action: 'hide'})
    }
  }
}

module.exports = DataProvider