const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class LegendPanelConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return {
      placement: 'row',
    }
  }

  get data () {
    const accessors = this._parent.getAccessors()
    const data = {}
    data.attributes = _.map(accessors, (accessor) => {
      return {
        key: accessor.accessor,
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor),
        checked: accessor.enabled,
      }
    })

    return data
  }
}

module.exports = LegendPanelConfigModel
