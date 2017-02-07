/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
/* global d3 */

const commons = require('commons')
const colorScheme = commons._c.d3ColorScheme10

const length = 20
const data = commons.fixture({
  length: 20,
  data: {
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [0, length * 3], repeat: true, gap: true},
    b: {linear: true, range: [0, length * 5], repeat: true},
    c: {linear: true, range: [0, length * 7]},
  },
})

const barChart = new coCharts.charts.XYChartView()
const areaChart = new coCharts.charts.XYChartView()
areaChart.setConfig({
  container: '#chart-area',
  components: [{
    type: 'Navigation',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 300,
      selection: [0, 50],
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Navigation Value',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'b',
            labelFormatter: 'Nav Label B',
            chart: 'LineChart',
            axis: 'y',
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
        },
        y: {
          position: 'left',
          ticks: 5,
        },
      }
    },
  }, {
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
            accessor: 'a',
            chart: 'AreaChart',
            axis: 'y',
            color: colorScheme[2]
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
        },
        y: {
          ticks: 10,
        }
      }
    }
  }]
})
barChart.setConfig({
  container: '#chart-bar',
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
          labelFormatter: 'Value',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'defaultTooltipId',
          },
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
        },
        y1: {
          position: 'left',
        },
      },
    },
  }, {
    id: 'default-tooltip-id',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'Value',
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
        }
      ]
    },
  }]
})

// Navigation component of areaChart will push the data to barChart
areaChart.setData(data)
