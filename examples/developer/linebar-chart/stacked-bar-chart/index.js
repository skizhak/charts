/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const coCharts = require('coCharts')
const commons = require('commons')

const length = 20
const data = commons.fixture({
  length: length,
  data: {
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [3, (length - 1) * 3], gap: true},
    b: {linear: true, range: [5, (length - 1) * 5], repeat: true},
    c: {linear: true, range: [7, (length - 1) * 7]},
  },
})

const container = 'grouped-bar-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
  components: [{
    id: 'grouped-bar-compositey',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      crosshair: 'crosshair-id',
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
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            enabled: true,
            chart: 'StackedBarChart',
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
    id: 'crosshair-id',
    type: 'Crosshair',
    config: {
      tooltip: 'default-tooltip',
    }
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
}

const chartView = new coCharts.charts.XYChartView()

module.exports = {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(data)
  },
  remove: () => {
    chartView.remove()
  }
}
