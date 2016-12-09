// Most basic chart.
var pieData = [
  { x: "System process", y: 4499890 },
  { x: "Process 1", y: 2704659 },
  { x: "Process 2", y: 2159981 },
  { x: "Process 3", y: 3853788 },
  { x: "Process 4", y: 14106543 },
  { x: "Process 5", y: 8819342 },
  { x: "Process 6", y: 612463 },
];
function numberFormatter (number) {
  return number.toFixed(2)
}
function getLabel (serie) {
  return serie.x
}
function getValue (serie) {
  return serie.y
}

var chartConfig = {
  components: [{
    type: 'radialChart',
    config: {
      el: '.pie-chart',
      chartWidth: 480,
      chartHeight: 360,
      radius: 100,
      colorScale: d3.scaleOrdinal().range(['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99', '#aaaa11', '#6633cc', '#e67300', '#8b0707', '#651067', '#329262', '#5574a6', '#3b3eac']),
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        formatter: numberFormatter,
      }
    },
  }, {
    type: 'tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'y',
          labelFormatter: function (key) {
            return key
          },
          valueFormatter: numberFormatter
        },
      ],
    },
  }, {
    type: 'legendUniversal',
    config: {
      el: '#pie-chart-legend',
    },
  }]
}
var chartView = new coCharts.charts.RadialChartView()
chartView.setConfig(chartConfig)
chartView.setData(pieData)