/* global coCharts */

const complexData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 10
  })
}

const chartConfigs = [
  {
    chartId: 'chart1',
    type: 'XYChartView',
    container: '#chart1',
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
              accessor: 'a',
              enabled: true,
              chart: 'bar',
              axis: 'y',
            }, {
              accessor: 'b',
              enabled: true,
              chart: 'bar',
              axis: 'y',
            }
          ]
        },
        axis: {
          x: {},
          y: {},
        }
      }
    }]
  }, {
    chartId: 'chart2',
    type: 'XYChartView',
    container: '#chart2',
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
              accessor: 'c',
              enabled: true,
              chart: 'line',
              axis: 'y',
            }
          ]
        }
      },
    }, {
      type: 'navigation',
      config: {
        chartHeight: 200,
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'c',
              enabled: true,
              chart: 'line',
              axis: 'y',
            }
          ]
        }
      }
    }]
  }
]

const chartView = new coCharts.charts.MultiChartView()
chartView.setConfig({
  chartId: 'parentChart',
  // Parent Chart components
  components: [],
  // Child charts.
  charts: chartConfigs,
})
chartView.setData(complexData, {}, 'chart1')
chartView.setData(complexData, {}, 'chart2')
chartView.render()
