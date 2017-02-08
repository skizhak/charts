/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')

const _ = commons._
const formatter = commons.formatter
const _c = commons._c

const queryChart = new coCharts.charts.XYChartView()
queryChart.setConfig({
  id: 'query-db-chart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'query-db-compositey',
      palette: _c.lbColorScheme17,
      editable: {
        colorSelector: true,
        chartSelector: true
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    id: 'query-db-compositey',
    type: 'CompositeYChart',
    config: {
      marginLeft: 80,
      marginRight: 80,
      chartHeight: 400,
      possibleChartTypes: ['StackedBarChart', 'LineChart'],
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'DB Read',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1'
          }, {
            accessor: 'b',
            labelFormatter: 'DB Write',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
          }, {
            accessor: 'c',
            labelFormatter: 'QE Queries',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2'
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.byteFormatter,
          domain: [0, undefined],
        },
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
        }
      }
    },
  }, {
    type: 'Navigation',
    config: {
      marginLeft: 80,
      marginRight: 80,
      chartHeight: 200,
      selection: [75, 100],
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'a',
            labelFormatter: 'DB Read',
            chart: 'StackedBarChart',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'b',
            labelFormatter: 'DB Write',
            chart: 'StackedBarChart',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'c',
            labelFormatter: 'Queries',
            chart: 'LineChart',
            axis: 'y2',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime
        },
        y1: {
          position: 'left',
          formatter: formatter.byteFormatter,
          ticks: 5,
        },
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
          ticks: 5
        }
      }
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'x',
        valueFormatter: formatter.extendedISOTime,
      },

      dataConfig: [
        {
          accessor: 'a',
          labelFormatter: 'DB Read',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'DB Write',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          labelFormatter: 'Queries',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }, {
    id: 'custom-tooltip',
    type: 'Tooltip',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }, {
    id: 'message-id',
    type: 'Message',
    config: {
      enabled: true,
    }
  }, {
    id: 'crosshair-id',
    type: 'Crosshair',
    config: {
      tooltip: 'default-tooltip',
    }
  }]
})

let simpleData = []
let now = _.now()

for (let i = 0; i < 100; i++) {
  simpleData.push(getDataPoint(now - (i * 1000)))
}

queryChart.setData(simpleData)

setInterval(() => {
  now += 1000
  simpleData.splice(99, 1)
  simpleData = [getDataPoint(now)].concat(simpleData)
  queryChart.setData(simpleData)
}, 1000)

function getDataPoint (x) {
  const a = Math.random() * 10000
  return {
    x: x,
    a: a,
    b: _.random(a, a + 1000),
    c: Math.ceil(Math.random() * 100),
  }
}
