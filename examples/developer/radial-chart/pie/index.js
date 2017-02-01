// Most basic chart.

const formatter = require('formatter')

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
      colorScale: d3.scaleOrdinal().range(['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99', '#aaaa11', '#6633cc', '#e67300', '#8b0707', '#651067', '#329262', '#5574a6', '#3b3eac']), // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.commaGroupedInteger,
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
          valueFormatter: formatter.commaGroupedInteger,
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
