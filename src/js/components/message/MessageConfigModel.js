/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')

const MessageConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
  },
  HTMLClassNames: {
    message: {
      default: 'coCharts-msg-default',
      info: 'coCharts-msg-info',
      error: 'coCharts-msg-error'
    },
    icon: {
      default: 'fa-comment-o',
      info: 'fa-info-circle',
      error: 'fa-exclamation-triangle'
    }
  }
})

module.exports = MessageConfigModel
