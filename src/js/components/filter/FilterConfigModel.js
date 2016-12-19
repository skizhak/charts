/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

class Self extends ContrailChartsConfigModel {
  constructor (p = {}) {
    super(p)
  }
}

module.exports = Self
