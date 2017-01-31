// Most basic chart.
const pieData = [
  {label: 'Disks In', value: 55},
  {label: 'Disks Out', value: 6},
  {label: 'Disks Up', value: 59},
  {label: 'Disks Down', value: 4}
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
      colorScale: d3.scaleOrdinal().range([
        '#00bcd4',
        '#fcc100',
        '#4caf50',
        '#c62828',
        ]), // eslint-disable-line no-undef
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
