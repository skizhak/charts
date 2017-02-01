/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const ContrailModel = require('contrail-model')

class SerieProvider extends ContrailModel {
  get defaults () {
    return {
      _type: 'SerieProvider',
    }
  }

  constructor (p) {
    super(p)
    if (this.has('parent')) {
      this.listenTo(this.get('parent'), 'change', this.parse)
    }
    this.parse()

    this.listenTo(this, 'change:error', this.triggerError)
  }

  parse () {
    this.set('data', this.get('parent').get('data'))
  }

  getLabels (formatter) {
    return _.map(this.get('data'), (serie) => formatter(serie))
  }
}

module.exports = SerieProvider
