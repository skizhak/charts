/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const length = 10
const data = require('fixture')({
  length: length,
  data: {
    t: {linear: true, range: [1475760930000, 1475800930000]},
    a: {random: true, range: [0, length * 3]},
    b: {random: true, range: [0, -length * 5]},
    c: {random: true, range: [0, -length * 5]},
  },
})
data[5].a = -10
const formatter = require('formatter')
const colorScheme = d3.schemeCategory10

const container = 'area-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
  title: 'Area Chart',
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
      crosshair: 'crosshair-id',
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
            stack: 'positive',
            axis: 'y',
            color: colorScheme[2],
            tooltip: 'default-tooltip',
          }, {
            enabled: true,
            accessor: 'b',
            chart: 'AreaChart',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[3],
            tooltip: 'default-tooltip',
          }, {
            enabled: true,
            accessor: 'c',
            chart: 'AreaChart',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[4],
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
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }]
}

let isInitialized = false
const chart = new coCharts.charts.XYChartView()

module.exports = {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    if (isInitialized) {
      chart.render()
    } else {
      isInitialized = true

      chart.setConfig(chartConfig)
      chart.setData(data)
    }
  }
}
