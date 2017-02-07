/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const dendrogamData = require('./data.json')

const container = 'radial-dendrogram-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
  components: [{
    id: 'dendrogram-chart-id',
    type: 'RadialDendrogram',
    config: {
      radius: 400,
      colorScale: d3.scaleOrdinal().range(d3.schemeCategory20), // eslint-disable-line no-undef
      hierarchyConfig: {
        parse: function (d) {
          const src = {
            names: [d.sourcevn, d.sourceip, d.sport, d.UuidKey],
            key: d.UuidKey,
            value: d['agg-bytes']
          }
          const dst = {
            names: [d.destvn, d.destip, d.dport, d.UuidKey],
            key: d.UuidKey,
            value: d['agg-bytes']
          }
          return [src, dst]
        }
      }
    }
  }
  ]
}

let isInitialized = false
const chartView = new coCharts.charts.RadialChartView()

module.exports = {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    if (isInitialized) {
      chartView.render()
    } else {
      isInitialized = true

      chartView.setConfig(chartConfig)
      chartView.setData(dendrogamData.data)
    }
  }
}
