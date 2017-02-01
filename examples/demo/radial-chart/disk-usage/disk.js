/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global d3 */

const pieData = [
  {label: 'Disks In', value: 55},
  {label: 'Disks Out', value: 6},
  {label: 'Disks Up', value: 59},
  {label: 'Disks Down', value: 4}
]

const formatter = require('formatter')

function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

const chartConfig = {
  container: '#disk-donut-chart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-chart',
    type: 'PieChart',
    config: {
      type: 'donut',
      radius: 100,
      colorScale: d3.scaleOrdinal().range([
        '#00bcd4',
        '#fcc100',
        '#4caf50',
        '#c62828',
      ]), // eslint-disable-line no-undef
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
      sourceComponent: 'donut-chart',
    },
  }
  ]
}
const chartView = new coCharts.charts.RadialChartView()
chartView.setConfig(chartConfig)
chartView.setData(pieData)