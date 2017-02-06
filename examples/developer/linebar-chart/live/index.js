/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const generator = require('fixture')
const formatter = require('formatter')
const chart = new coCharts.charts.XYChartView()

let counter = 0
const length = 21

setInterval(() => {
  const dataConfig = {
    length: length,
    data: {
      x: {linear: true, range: [counter, counter + length]},
      a: {linear: true, range: [counter, counter + length * 3]},
    },
  }
  const data = generator(dataConfig)
  chart.setData(data)
  counter++
}, 1000)

chart.setConfig({
  container: '#chart',
  components: [{
    id: 'compositey-id',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'X Value',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
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
          formatter: formatter.toInteger,
        }
      },
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'X value',
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }]
})
