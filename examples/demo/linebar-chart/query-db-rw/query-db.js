/* global d3 coCharts */

const _ = require('lodash')

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function numberFormatter (number) {
  return number.toFixed(0)
}

function memFormatter (number) {
  const bytePrefixes = ['B', 'KB', 'MB', 'GB', 'TB']
  let bytes = parseInt(number * 1024)
  let formattedBytes = '-'
  _.each(bytePrefixes, (prefix, idx) => {
    if (bytes < 1024) {
      formattedBytes = bytes.toFixed(1) + ' ' + prefix
      return false
    } else {
      if (idx === bytePrefixes.length - 1) {
        formattedBytes = bytes.toFixed(1) + ' ' + prefix
      } else {
        bytes = bytes / 1024
      }
    }
  })
  return formattedBytes
}

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
  container: '#complexChart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'complexChartCompositeY',
      placement: 'row',
      coloPicker: true,
      filter: true,
      chartSelector: true,
    },
  }, {
    type: 'ControlPanel',
    config: {
      menu: [
        { id: 'Refresh' },
      ],
    },
  }, {
    id: 'complexChartCompositeY',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      crosshair: 'crosshairId',
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Cassandra DB Read',
            enabled: true,
            chart: 'StackedBarChart',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChart'
              }, {
                label: 'Bar',
                chart: 'BarChart'
              }, {
                label: 'Line',
                chart: 'LineChart'
              }
            ],
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Cassandra DB Write',
            enabled: true,
            chart: 'StackedBarChart',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChart'
              }, {
                label: 'Bar',
                chart: 'BarChart'
              }, {
                label: 'Line',
                chart: 'LineChart'
              }
            ],
            axis: 'y1',
            tooltip: 'customTooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'QE Queries',
            enabled: true,
            chart: 'LineChart',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChart'
              }, {
                label: 'Bar',
                chart: 'BarChart'
              }, {
                label: 'Line',
                chart: 'LineChart'
              }
            ],
            axis: 'y2',
            tooltip: 'defaultTooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: d3.timeFormat('%H:%M:%S')
        },
        y1: {
          position: 'left',
          formatter: memFormatter,
          domain: [0, undefined],
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
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
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          ticks: 5,
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
          ticks: 5,
        }
      }
    },
  }, {
    id: 'defaultTooltip',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'x',
        valueFormatter: timeFormatter,
      },

      dataConfig: [
        {
          accessor: 'a',
          labelFormatter: 'DB Read',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'b',
          labelFormatter: 'DB Write',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'c',
          labelFormatter: 'Queries',
          valueFormatter: numberFormatter,
        }
      ]
    },
  }, {
    id: 'customTooltip',
    type: 'Tooltip',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }, {
    id: 'messageId',
    type: 'Message',
    config: {
      enabled: true,
    }
  }, {
    id: 'crosshairId',
    type: 'Crosshair',
    config: {
      tooltip: 'defaultTooltip',
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
