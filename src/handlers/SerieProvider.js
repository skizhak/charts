/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const ContrailModel = require('contrail-model')

class SerieProvider extends ContrailModel {
  get defaults () {
    return {
      _type: 'SerieProvider',
      // Data formatter
      formatData: undefined,
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

  setConfig (config) {
    this.set(config)
  }

  parse () {
    let data = this.get('parent').get('data')
    const formatData = this.get('formatData')
    if (_.isFunction(formatData)) {
      data = formatData(data)
    }
    this.set('data', data)
  }

  getLabels (formatter) {
    return _.map(this.get('data'), (serie) => formatter(serie))
  }
}

module.exports = SerieProvider
