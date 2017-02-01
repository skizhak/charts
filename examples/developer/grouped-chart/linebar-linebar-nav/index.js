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
    chartId: 'grouped-chart1',
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
        },
        axis: {
          x: {},
          y: {},
        }
      }
    }]
  }, {
    chartId: 'grouped-chart2',
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
    }, {
      type: 'Navigation',
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
              chart: 'LineChart',
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
  chartId: 'grouped-parent-chart',
  // Parent Chart components
  components: [],
  // Child charts.
  charts: chartConfigs,
})
chartView.setData(complexData, {}, 'grouped-chart1')
chartView.setData(complexData, {}, 'grouped-chart2')
chartView.render()
