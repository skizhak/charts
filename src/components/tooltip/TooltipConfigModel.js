/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class TooltipConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      // Which tooltip ids to accept. If empty accept all.
      acceptFilters: [],
      sticky: false,
    }
  }

  get sourceId () {
    return this._parent.id
  }
  // TODO
  get stickyMargin () {
    return {left: 0, right: 0}
  }

  getFormattedData (inData) {
    var outData = {}
    const dataConfig = this.get('dataConfig')
    const titleConfig = this.get('title')

    if (titleConfig) {
      outData.title = _.isString(titleConfig) ? titleConfig : this.getFormattedValue(inData, titleConfig)
    }

    outData.color = this.get('color')
    outData.backgroundColor = this.get('backgroundColor')

    outData.items = _.map(dataConfig, datumConfig => {
      return {
        label: this.getLabel(inData, datumConfig),
        value: this.getFormattedValue(inData, datumConfig),
      }
    })

    return outData
  }
}
