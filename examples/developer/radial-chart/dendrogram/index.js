/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import 'coCharts'
import commons from 'commons'
import dendrogamData from './data.json'

const _c = commons._c
const container = 'radial-dendrogram-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'dendrogram-chart-id',
      editable: {
        colorSelector: true,
        chartSelector: false
      },
      placement: 'horizontal',
      filter: true
    }
  }, {
    id: 'dendrogram-chart-id',
    type: 'RadialDendrogram',
    config: {
      parentSeparation: 1.0,
      parentSeparationShrinkFactor: 0.05,
      parentSeparationDepthThreshold: 4,
      colorScale: d3.scaleOrdinal().range(_c.radialColorScheme10), // eslint-disable-line no-undef
      drawLinks: false,
      drawRibbons: true,
      arcWidth: 15,
      arcLabelLetterWidth: 5,
      showArcLabels: true,
      arcLabelXOffset: 2,
      arcLabelYOffset: 25,
      levels: [ { level: 0, label: 'Virtual Network' }, { level: 1, label: 'IP' }, { level: 2, label: 'Port' } ],
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
      tooltip: 'tooltip-id'
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      formatter: (data) => {
        const type = ['Virtual Network', 'IP', 'Port']
        let content = {title: data.name, items: []}
        content.items.push({
          label: 'Type',
          value: type[data.level - 1]
        }, {
          label: 'Flow Count',
          value: data.children.length
        })
        return content
      }
    }
  }
  ]
}

const chartView = new coCharts.charts.RadialChartView()

export default {
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
