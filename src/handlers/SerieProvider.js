/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailModel from 'contrail-model'

export default class SerieProvider extends ContrailModel {
  get defaults () {
    return {
      _type: 'SerieProvider',
      // Data formatter
      formatter: undefined,
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
    const formatter = this.get('formatter')
    if (_.isFunction(formatter)) {
      data = formatter(data)
    }
    this.set('data', data)
  }

  getLabels (formatter) {
    return _.map(this.get('data'), (serie) => formatter(serie))
  }
}
