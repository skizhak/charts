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
    /**
     * We're assuming one navigation for a visualization.
     * This action may get triggered for same chart visualization with navigation or navigation from different chart
     * If the chart has visualization component, we're changing the model of CompositeY
     * else, set the data of the chart so it goes through the data preparation for that chart visualization.
     */
    if (!_.isEmpty(chart.getComponentsByType('Navigation'))) {
      _.each(chart.getComponentsByType('CompositeYChart'), (compositeY) => {
        compositeY.changeModel(dataProvider)
      })
    } else {
      chart.setData(dataProvider.data)
    }
  }
}

module.exports = ChangeSelection
