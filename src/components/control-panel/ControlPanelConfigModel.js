/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')
module.exports = class ControlPanelConfigModel extends ContrailChartsConfigModel {
  get menuItems () {
    return {
      Refresh: {
        title: 'Refresh chart',
        icon: 'fa fa-refresh',
      },
      Freeze: {
        title: 'Stop Live Update',
        icon: 'fa fa-stop',
      },
      Unfreeze: {
        title: 'Start Live Update',
        icon: 'fa fa-play',
      },
      ColorPicker: {
        title: 'Select color for serie',
        icon: 'fa fa-eyedropper',
      },
      Filter: {
        title: 'Select serie to show',
        icon: 'fa fa-filter',
      }
    }
  }
}
