/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

define([ // eslint-disable-line no-undef
  'd3v4', // Example use of multiple d3 versions. chart will use d3v4 instead of older d3.
  'lodash',
  'contrail-charts',
], function (d3, _, coCharts) {
  const container = ['requirejs-linebar-chart', 'requirejs-line-chart']
  const layoutMeta = {
    'requirejs-linebar-chart': 'col-xs-11 col-md-11',
    'requirejs-line-chart': 'col-xs-11 col-md-11'
  }

  const data = []
  _.each(d3.range(100), (i) => {
    const a = Math.random() * 100
    data.push({
      x: 1475760930000 + 1000000 * i,
      a: a,
      b: a + Math.random() * 10,
      c: Math.random() * 100,
      d: i + (Math.random() - 0.5) * 10,
      e: (Math.random() - 0.5) * 10
    })
  })

  // Most basic chart.
  const lineData = [
    { x: 1475760930000, y: 0 },
    { x: 1475761930000, y: 3 },
    { x: 1475762930000, y: 2 },
    { x: 1475763930000, y: 4 },
    { x: 1475764930000, y: 5 }
  ]

  const chartConfig = {
    id: container[0],
    components: [{
      type: 'CompositeYChart',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 500,
        plot: {
          x: {
            accessor: 'x',
            label: 'Time',
            axis: 'x',
          },
          y: [
            {
              accessor: 'a',
              label: 'Label A',
              enabled: true,
              chart: 'StackedBarChart',
              axis: 'y1',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'b',
              label: 'Label B',
              enabled: true,
              chart: 'StackedBarChart',
              axis: 'y1',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'c',
              label: 'Label C',
              enabled: false,
              chart: 'StackedBarChart',
              axis: 'y1',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'd',
              label: 'Megabytes D',
              color: '#d62728',
              enabled: true,
              chart: 'LineChart',
              axis: 'y2',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'e',
              label: 'Megabytes E',
              color: '#9467bd',
              enabled: true,
              chart: 'LineChart',
              axis: 'y2',
              tooltip: 'default-tooltip',
            }
          ]
        },
        axis: {
          x: {},
          y1: {
            position: 'left',
            formatter: (value) => value.toFixed(0),
            labelMargin: 15
          },
          y2: {
            position: 'right',
            formatter: (value) => value.toFixed(2),
            labelMargin: 15
          }
        }
      },
    }, {
      id: 'default-tooltip',
      type: 'Tooltip',
      config: {
        dataConfig: [
          {
            accessor: 'x',
            labelFormatter: (key) => 'Time',
            valueFormatter: (value) => value.toFixed(0)
          }, {
            accessor: 'a',
            labelFormatter: () => 'Label A',
            valueFormatter: (value) => value.toFixed(5)
          }, {
            accessor: 'b',
            labelFormatter: () => 'Label B',
            valueFormatter: (value) => value.toFixed(2)
          }
        ]
      }
    }]
  }

  const lineChartConfig = {
    id: container[1],
    components: [{
      type: 'CompositeYChart',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 300,
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              enabled: true,
              accessor: 'y',
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        }
      }
    }]
  }

  const chartView = new coCharts.charts.XYChartView()
  const lineChartView = new coCharts.charts.XYChartView()

  return {
    container: container,
    layoutMeta: layoutMeta,
    render: function () {
      chartView.setConfig(chartConfig)
      lineChartView.setConfig(lineChartConfig)
      chartView.setData(data)
      lineChartView.setData(lineData)
    },
    remove: () => {
      chartView.remove()
      lineChartView.remove()
    }
  }
})
