/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import 'coCharts'
import commons from 'commons'

const formatter = commons.formatter
const _c = commons._c
const radialColorScheme6 = _c.radialColorScheme6

const pieData = [
  {label: 'Volumes', value: 112704659},
  {label: 'Images', value: 96853788},
  {label: 'Internal', value: 943853788},
  {label: 'Volumes HDD A', value: 130792673},
  {label: 'Volumns HDD B', value: 1127576593},
]

function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

const container = 'pools-pie'
const layoutMeta = {
  [container]: 'col-md-6'
}

const chartConfig = {
  id: container,
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'pools-pie-chart',
    type: 'PieChart',
    config: {
      type: 'pie',
      radius: 150,
      colorScale: d3.scaleOrdinal().range(radialColorScheme6), // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.byteFormatter,
      },
      tooltip: 'tooltip-id',
    },
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: getLabel,
          valueFormatter: formatter.byteFormatter,
        },
      ],
    },
  }, {
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'pools-pie-chart',
    },
  }
  ]
}

const chartView = new coCharts.charts.RadialChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(pieData)
  },
  remove: () => {
    chartView.remove()
  }
}
