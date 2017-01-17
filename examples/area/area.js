// Most basic chart.
const simpleData = [
  { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
  { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
  { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
  { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
  { x: (new Date(2016, 11, 5)).getTime(), y: 5 },
]
const simpleChartView = new coCharts.charts.XYChartView()
simpleChartView.setConfig({
  container: '#simpleChart',
  components: [{
    type: 'compositeY',
    config: {
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'y',
            chart: 'area',
            axis: 'y',
          }
        ]
      },
      axis: {
        x: {
          domain: [(new Date(2016, 11, 2)).getTime(), (new Date(2016, 11, 4)).getTime()]
        },
        y: {
          domain: [0, 10],
          ticks: 20,
        }
      }
    }
  }]
})
simpleChartView.setData(simpleData)
