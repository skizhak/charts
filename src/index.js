const handlers = require('handlers/index')
const components = require('components/index')
const charts = require('charts/index')
const formatter = require('plugins/valueFormatters.js')

require('./styles/index.scss')

module.exports = {
  handlers: handlers,
  components: components,
  charts: charts,
  formatter: formatter,
}
