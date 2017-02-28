/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {charts} from 'coCharts'
import {formatter} from 'commons'

const pieData = [
    { label: 'Process 1', value: 2704659 },
    { label: 'Process 2', value: 2159981 },
    { label: 'Process 3', value: 3853788 },
    { label: 'Process 4', value: 14106543 },
    { label: 'Process 5', value: 8819342 },
    { label: 'Process 6', value: 612463 },
    { label: 'Process 7', value: 4499890 }
]

function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

const container = 'donut-chart'
const layoutMeta = {
  [container]: 'col-md-6'
}

const chartConfig = {
  id: container,
  title: 'Donut Chart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-chart-id',
    type: 'PieChart',
    config: {
      type: 'donut',
      radius: 150,
      colorScheme: d3.schemeCategory20, // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.commaGroupedInteger,
      },
      tooltip: 'tooltip-id',
    },
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: 'Process Info',
      color: '#333',
      backgroundColor: '#fafafa',
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: getLabel,
          valueFormatter: formatter.commaGroupedInteger,
        },
      ],
    },
  }, {
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'donut-chart-id',
    },
  }
  ]
}

const chartView = new charts.RadialChartView()

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