/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {charts} from 'coCharts'
import {_c, fixture} from 'commons'

const colorScheme = _c.d3ColorScheme10
const length = 20
const data = fixture({
  length: 20,
  data: {
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [0, length * 3], repeat: true},
    b: {linear: true, range: [0, length * 5], repeat: true},
    c: {linear: true, range: [0, length * 7]},
  },
})

const container = ['area-chart', 'bar-chart']
const layoutMeta = {
  [container[0]]: 'render-order-1 col-md-12',
  [container[1]]: 'render-order-2 col-md-12'
}

const areaChartConfig = {
  id: container[0],
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
}
const barChartConfig = {
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
}

const barChart = new charts.XYChartView()
const areaChart = new charts.XYChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    areaChart.setConfig(areaChartConfig)
    barChart.setConfig(barChartConfig)

    areaChart.setData(data)
    barChart.setData(data)
  },
  remove: () => {
    areaChart.remove()
    barChart.remove()
  }
}
