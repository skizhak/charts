/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const pieData = [
    { label: 'Process 1', value: 2704659 },
    { label: 'Process 2', value: 2159981 },
    { label: 'Process 3', value: 3853788 },
    { label: 'Process 4', value: 14106543 },
    { label: 'Process 5', value: 8819342 },
    { label: 'Process 6', value: 612463 },
    { label: 'Process 7', value: 4499890 }
]
function numberFormatter (number) {
  return d3.format(',.0f')(number) // eslint-disable-line no-undef
}
function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

const chartConfig = {
  container: '#chart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'pieChartId',
    type: 'PieChart',
    config: {
      type: 'donut',
      radius: 100,
      colorScale: d3.scaleOrdinal().range(d3.schemeCategory20), // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: numberFormatter,
      },
      tooltip: 'tooltipId',
    },
  }, {
    id: 'tooltipId',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: getLabel,
          valueFormatter: numberFormatter,
        },
      ],
    },
  }, {
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'pieChartId',
    },
  }
  ]
}
const chartView = new coCharts.charts.RadialChartView()
chartView.setConfig(chartConfig)
chartView.setData(pieData)
