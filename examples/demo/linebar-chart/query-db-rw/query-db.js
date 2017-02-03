/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const formatter = require('formatter')
const _c = require('constants')

// Complex example
const simpleData = []

for (let i = 0; i < 100; i++) {
  const a = Math.random() * 10000
  simpleData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: _.random(a, a + 1000),
    c: Math.ceil(Math.random() * 100),
  })
}
const complexChartView = new coCharts.charts.XYChartView()
complexChartView.setConfig({
  container: '#query-db-chart',
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
    type: 'ControlPanel',
    config: {
      menu: [
        {id: 'Refresh'},
      ],
    },
  }, {
    id: 'query-db-compositey',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      crosshair: 'crosshair-id',
      possibleChartTypes: ['BarChart', 'StackedBarChart', 'LineChart'],
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
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'DB Write',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'custom-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'QE Queries',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
            tooltip: 'default-tooltip',
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
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
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
complexChartView.setData(simpleData)
complexChartView.renderMessage({
  componentId: 'XYChart',
  action: 'once',
  messages: [{
    level: 'info',
    title: 'Message 1',
    message: 'This is an example message. It will disapear after 5 seconds.'
  }, {
    level: 'error',
    title: 'A Fatal Error',
    message: 'This is an error.'
  }, {
    level: 'info',
    title: 'Message 2',
    message: 'This is another example message.'
  }]
})
