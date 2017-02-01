/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const handlers = require('handlers/index')
const components = require('components/index')
const charts = require('charts/index')

require('./styles/index.scss')

module.exports = {
  handlers: handlers,
  components: components,
  charts: charts,
}
