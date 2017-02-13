/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')

const length = 20
const data = commons.fixture({
  length: 20,
  data: {
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [0, length * 3], gap: true},
    b: {linear: true, range: [0, length * 5], repeat: true},
    c: {linear: true, range: [0, length * 7]},
  },
})

const complexChartView = new coCharts.charts.XYChartView()
complexChartView.setConfig({
  id: 'grouped-bar-chart',
  components: [{
    id: 'grouped-bar-compositey',
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
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }
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
    id: 'default-tooltip',
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
complexChartView.setData(data)
