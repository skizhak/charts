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
      _type: 'DataProvider',

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
      // expected functions: getData(), getQueryLimit(), setQueryLimit()
      parentDataModel: undefined,

      error: false,

      // List or error objects with level and error message
      errorList: [],

      messageEvent: _.extend({}, ContrailEvents)
    }
  }

  initialize (options) {
    // Listen for changes in the parent model.
    if (this.hasParentModel()) {
      this.listenTo(this.getParentModel(), 'change', this.prepareData)
    }
    this.prepareData()

    this.listenTo(this, 'change:error', this.triggerError)
  }

  getParentModel () {
    return this.get('parentDataModel')
  }

  hasParentModel () {
    return this.has('parentDataModel')
  }

  getData () {
    return this.get('data')
  }

  setData (data) {
    this.set({data: data})
  }

  getParentData () {
    let data
    if (this.hasParentModel() && _.isFunction(this.getParentModel().getData)) {
      data = this.getParentModel().getData()
    } else {
      data = []
    }
    return data
  }

  getQueryLimit () {
    let queryLimit
    if (this.hasParentModel() && _.isFunction(this.getParentModel().getQueryLimit)) {
      queryLimit = this.getParentModel().getQueryLimit()
    } else {
      queryLimit = {}
    }
    return queryLimit
  }
  /**
   * Calls the parent's setQueryLimit() function. In practice this will iterate down to the DataModel and should cause a data re-fetch with new limits.
   */
  setQueryLimit (queryLimit) {
    if (this.hasParentModel() && _.isFunction(this.getParentModel().setQueryLimit)) {
      this.getParentModel().setQueryLimit(queryLimit)
    }
    const range = this.getRange()
    _.each(queryLimit, (queryRange, key) => {
      delete range[key]
    })
  }

  getRange () {
    return this.get('range')
  }

  getManualRange () {
    return this.get('manualRange')
  }

  getRangeFor (constiableName) {
    const range = this.getRange()
    if (!_.has(range, constiableName)) {
      range[constiableName] = this.calculateRangeForDataAndVariableName(this.getData(), constiableName)
    }
    return range[constiableName]
  }

  getParentRange () {
    let parentRange
    if (this.hasParentModel() && _.isFunction(this.getParentModel().getRange)) {
      parentRange = this.getParentModel().getRange()
    } else {
      parentRange = {}
    }
    return parentRange
  }

  setRange (range) {
    this.set({range: range})
  }

  /**
   * Sets the ranges and manual ranges for the constiables provided in the newRange object.
   * Example: setRangeFor( { x: [0,100], y: [5,10] } )
   */
  setRangeFor (newRange) {
    const range = _.extend({}, this.getRange())
    const manualRange = _.extend({}, this.getManualRange())
    _.each(newRange, (constiableRange, constiableName) => {
      range[constiableName] = constiableRange
      manualRange[constiableName] = constiableRange
    })
    this.setRanges(range, manualRange)
  }

  resetRangeFor (newRange) {
    const range = _.extend({}, this.getRange())
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

  setRangeAndFilterData (newRange) {
    this.setDataAndRanges(this.filterDataByRange(this.getParentData(), newRange), newRange, newRange)
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

  setDataAndRanges (data, range, manualRange) {
    if (!data) {
      data = this.getParentData()
    }
    const formatData = this.get('formatData')
    if (_.isFunction(formatData)) {
      data = formatData(data, manualRange)
    }
    this.set({data: data, range: range, manualRange: manualRange})
  }

  filterDataByRange (data, range) {
    return _.filter(data, (d) => {
      let ok = true
      _.each(range, (range, key) => {
        if (!_.has(d, key)) {
          ok = false
        } else {
          if (d[key] < range[0] || d[key] > range[1]) {
            ok = false
          }
        }
      })
      return ok
    })
  }

  setRanges (range, manualRange) {
    // const data = this.getParentData()
    let data = this.getData()
    const formatData = this.get('formatData')
    if (!manualRange) {
      manualRange = this.get('manualRange')
    }
    if (_.isFunction(formatData)) {
      data = formatData(data, manualRange)
    }
    this.set({data: data, range: range, manualRange: manualRange})
  }
  /**
   * Take the parent's data and filter / format it.
   * Called on initialization and when parent data changed.
   */
  prepareData () {
    // Set the new data array and reset range - leave the manual range.
    this.setDataAndRanges(null, {}, {})
  }

  triggerError () {
    if (this.error) {
      this.messageEvent.trigger('error', {type: this._type, action: 'show', messages: this.errorList})
    } else {
      this.messageEvent.trigger('error', {type: this._type, action: 'hide'})
    }
  }
}

module.exports = DataProvider
