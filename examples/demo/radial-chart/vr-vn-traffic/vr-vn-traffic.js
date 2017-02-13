/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')
const _c = commons._c

const colorScheme = _c.bubbleColorScheme6
const dendrogamData = {
  data: commons.dg.vRouterTraffic()
}

const chartConfig = {
  id: 'radial-dendrogram-chart',
  components: [{
    id: 'dendrogram-chart-id',
    type: 'RadialDendrogram',
    config: {
      //radius: 100,
      parentSeparation: 1.0,
      parentSeparationShrinkFactor: 0.05,
      parentSeparationDepthThreshold: 4,
      colorScale: d3.scaleOrdinal().range([colorScheme[0], colorScheme[2], colorScheme[3]]), // eslint-disable-line no-undef
      drawLinks: false,
      drawRibbons: true,
      biDirectional: true,
      hierarchyConfig: {
        parse: function(d) {
          const srcHierarchy = [d.sourcevn, d.sourceip, d.sport]
          //const srcHierarchy = [d.sourcevn, d.sourceip]
          const src = {
            names: srcHierarchy,
            id: srcHierarchy.join('-'),
            value: d['agg-bytes']
          }
          const dstHierarchy = [d.destvn, d.destip, d.dport]
          //const dstHierarchy = [d.destvn, d.destip]
          const dst = {
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

