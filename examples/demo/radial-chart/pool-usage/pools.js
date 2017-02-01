// Most basic chart.
const pieData = [
  {label: 'Volumes', value: 112704659},
  {label: 'Images', value: 96853788},
  {label: 'Internal', value: 943853788},
  {label: 'Volumes HDD A', value: 130792673},
  {label: 'Volumns HDD B', value: 1127576593},
]

const d3 = require('d3')
const formatter = require('formatter')

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
      type: 'pie',
      radius: 100,
      colorScale: d3.scaleOrdinal().range([
        '#4caf50',
        '#a88add',
        '#fcc100',
        '#6887ff',
        '#00bcd4',
        '#2196f3']), // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.byteFormatter,
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
          valueFormatter: formatter.byteFormatter,
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
