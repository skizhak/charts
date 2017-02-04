/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

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
    id: 'grouped-chart1',
    type: 'XYChart',
    container: '#grouped-chart1',
    components: [{
      type: 'CompositeYChart',
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
              chart: 'BarChart',
              axis: 'y',
            }, {
              accessor: 'b',
              enabled: true,
              chart: 'BarChart',
              axis: 'y',
            }
          ]
        }
      }
    }]
  }, {
    id: 'grouped-chart2',
    type: 'XYChart',
    container: '#grouped-chart2',
    components: [{
      type: 'CompositeYChart',
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
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        }
      },
    }]
  }, {
    id: 'grouped-chart-navigation',
    type: 'XYChart',
    container: '#grouped-chart-navigation',
    components: [{
      type: 'Navigation',
      config: {
        chartHeight: 200,
        selection: [85, 100],
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'c',
              enabled: true,
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        },
        onChangeSelection: (dataProvider, chart) => {
          const chartToUpdate = ['grouped-chart1', 'grouped-chart2']
          if (_.includes(chartToUpdate, chart.el.id)) {
            chart.setData(dataProvider.data)
          }
        }
      }
    }]
  }
]

const chartView = new coCharts.charts.MultiChartView()
chartView.setConfig({
  chartId: 'grouped-parent-chart',
  // Parent Chart components
  components: [],
  // Child charts.
  charts: chartConfigs,
})
// selection on navigation will set the data on these charts.
// chartView.setData(complexData, {}, 'grouped-chart1')
// chartView.setData(complexData, {}, 'grouped-chart2')
chartView.setData(complexData, {}, 'grouped-chart-navigation')
chartView.render()
