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
      parentSeparation: 1.0,
      parentSeparationShrinkFactor: 0.06,
      parentSeparationDepthThreshold: 4,
      colorScale: d3.scaleOrdinal().range(d3.schemeCategory20), // eslint-disable-line no-undef
      drawLinks: false,
      drawRibbons: true,
      biDirectional: true,
      hierarchyConfig: {
        parse: function(d) {
          const srcHierarchy = [d.sourcevn, d.sourceip, d.sport]
          const src = {
            //names: [d.sourcevn, d.sourceip, d.sport, d.UuidKey],
            names: srcHierarchy,
            id: srcHierarchy.join('-'),
            value: d['agg-bytes']
          }
          const dstHierarchy = [d.destvn, d.destip, d.dport]
          const dst = {
            //names: [d.destvn, d.destip, d.dport, d.UuidKey],
            names: dstHierarchy,
            id: dstHierarchy.join('-'),
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
