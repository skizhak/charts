/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

define([ // eslint-disable-line no-undef
  'd3', // Example use of older d3 versions.
  'lodash',
  'contrail-charts',
], function (d3, _, coCharts) {
  // Complex example
  const complexData = []
  _.each(d3.range(100), (i) => {
    const a = Math.random() * 100
    complexData.push({
      x: 1475760930000 + 1000000 * i,
      a: a,
      b: a + Math.random() * 10,
      c: Math.random() * 100,
      d: i + (Math.random() - 0.5) * 10,
      e: (Math.random() - 0.5) * 10
    })
  })

  const complexChartView = new coCharts.charts.XYChartView()
  complexChartView.setData(complexData)
  complexChartView.setConfig({
    container: '#requirejs-linebar-chart',
    components: [{
      type: 'CompositeYChart',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
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
  })
  complexChartView.render()

  // Most basic chart.
  const simpleData = [
    { x: 1475760930000, y: 0 },
    { x: 1475761930000, y: 3 },
    { x: 1475762930000, y: 2 },
    { x: 1475763930000, y: 4 },
    { x: 1475764930000, y: 5 }
  ]
  const simpleChartView = new coCharts.charts.XYChartView()
  simpleChartView.setData(simpleData)
  simpleChartView.setConfig({
    container: '#requirejs-line-chart',
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
              enabled: true,
              accessor: 'y',
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        }
      }
    }]
  })
  simpleChartView.render()
})
