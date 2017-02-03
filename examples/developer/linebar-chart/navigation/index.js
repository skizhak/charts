/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
/* global d3 */

const data = require('fixture').simpleStatic
const colorScheme = d3.schemeCategory10

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
      chartHeight: 200,
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
            accessor: 'a',
            labelFormatter: 'Nav Label A',
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
          domain: [0, 30],
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
