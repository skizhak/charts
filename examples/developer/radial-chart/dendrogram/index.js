/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const dendrogamData = require('./data.json')

const chartConfig = {
  container: '#radial-dendrogram-chart',
  components: [{
    id: 'dendrogram-chart-id',
    type: 'RadialDendrogram',
    config: {
      //radius: 100,
      parentSeparation: 1,
      parentSeparationThreshold: 2,
      colorScale: d3.scaleOrdinal().range(d3.schemeCategory20), // eslint-disable-line no-undef
      hierarchyConfig: {
        parse: function(d) {
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

const chartView = new coCharts.charts.RadialChartView()
chartView.setConfig(chartConfig)
chartView.setData(dendrogamData.data)
