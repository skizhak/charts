/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {charts} from 'coCharts'
import flowData from './data.json'

const container = 'sankey-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
  components: [{
    id: 'sankey-chart-component',
    type: 'Sankey',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      parseConfig: {
        parse: function (d) {
          const links = []
          const srcHierarchy = [d.sport, d.sourceip, d.sourcevn]
          links.push({
            source: 'sport-' + srcHierarchy[0]
            target: 'sip-' + srcHierarchy[1]
            value: d['agg-bytes']
          })
          links.push({
            source: 'sip-' + srcHierarchy[1]
            target: 'svn-' + srcHierarchy[2]
            value: d['agg-bytes']
          })
          return links
        }
      },
    }
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'Value',
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
        }
      ]
    }
  }]
}

//const chartView = new charts.XYChartView()
const chartView = new charts.RadialChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(flowData)
    chartView.render()
  },
  remove: () => {
    chartView.remove()
  }
}
