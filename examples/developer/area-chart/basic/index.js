/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const length = 10
const data = require('fixture')({
  length: length,
  data: {
    t: {linear: true, range: [1475760930000, 1475800930000]},
    a: {random: true, range: [0, length * 3]},
    b: {random: true, range: [0, length * 3]},
  },
})
const formatter = require('formatter')
const colorScheme = d3.schemeCategory10

const chart = new coCharts.charts.XYChartView()
chart.setConfig({
  container: '#area-chart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'compositey-id',
      editable: {
        colorSelector: true,
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    id: 'compositey-id',
    type: 'CompositeYChart',
    config: {
      plot: {
        x: {
          accessor: 't',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'a',
            chart: 'AreaChart',
            axis: 'y',
            label: 'A',
            color: colorScheme[2],
            tooltip: 'default-tooltip',
          }, {
            enabled: true,
            accessor: 'b',
            chart: 'AreaChart',
            axis: 'y',
            label: 'B',
            color: colorScheme[3],
            tooltip: 'default-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y: {
          ticks: 10,
        }
      }
    }
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }]
})
chart.setData(data)
