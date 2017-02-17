/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const coCharts = require('coCharts')

const commons = require('commons')
const _c = commons._c

const dendrogamData = {
  data: commons.dg.vRouterTraffic()
}

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
      parentSeparation: 1.0,
      parentSeparationShrinkFactor: 0.05,
      parentSeparationDepthThreshold: 4,
      colorScale: d3.scaleOrdinal().range(_c.radialColorScheme10), // eslint-disable-line no-undef
      drawLinks: false,
      drawRibbons: true,
      biDirectional: true,
      hierarchyConfig: {
        parse: function (d) {
          const srcHierarchy = [d.sourcevn, d.sourceip, d.sport]
          const src = {
            names: srcHierarchy,
            id: srcHierarchy.join('-'),
            value: d['agg-bytes']
          }
          const dstHierarchy = [d.destvn, d.destip, d.dport]
          const dst = {
            names: dstHierarchy,
            id: dstHierarchy.join('-'),
            value: d['agg-bytes']
          }
          return [src, dst]
        }
      },
      drillDownLevel: 3,
      tooltip: 'tooltip-id'
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      formatter: (data) => {
        const type = ['Virtual Network', 'IP', 'Port']
        let content = {title: type[data.level - 1], items: []}
        content.items.push({
          label: 'Value',
          value: data.name
        }, {
          label: 'Flow Count',
          value: data.children.length
        })
        return content
      }
    },
  }
  ]
}

// Create chart view.
const chartView = new coCharts.charts.RadialChartView()

module.exports = {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(dendrogamData.data)
  },
  remove: () => {
    chartView.remove()
  }
}
