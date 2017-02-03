/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const Action = require('../plugins/Action')

class ChangeSelection extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (dataProvider) {
    const chart = this._registrar
    _.each(chart.getComponentsByType('CompositeYChart'), (compositeY) => {
      compositeY.changeModel(dataProvider)
    })
  }
}

module.exports = ChangeSelection
