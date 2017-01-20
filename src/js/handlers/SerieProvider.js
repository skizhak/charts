/**
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 * Handler for single serie data type
 */
const _ = require('lodash')
const ContrailModel = require('contrail-model')

class SerieProvider extends ContrailModel {
  get defaults () {
    return {
      _type: 'SerieProvider',
    }
  }

  initialize (options) {
    if (this.has('parent')) {
      this.listenTo(this.get('parent'), 'change', this.parse)
    }
    this.parse()

    this.listenTo(this, 'change:error', this.triggerError)
  }

  parse () {
    this.set('data', this.get('parent').getData())
  }

  getLabels (formatter) {
    return _.map(this.get('data'), function (serie) {
      return formatter(serie)
    })
  }
}

module.exports = SerieProvider
