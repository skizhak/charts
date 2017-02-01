/* global coCharts */

const formatter = require('formatter')

// Complex example
const complexData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 100,
    d: i + (Math.random() - 0.5) * 10,
    e: (Math.random() - 0.5) * 10
  })
}
const complexChartView = new coCharts.charts.XYChartView()
complexChartView.setConfig({
  container: '#complexChart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'complexChartCompositeY',
      editable: true
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
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'BarChart',
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
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'BarChart',
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
            labelFormatter: 'Label C',
            enabled: false,
            chart: 'BarChart',
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
            accessor: 'd',
            labelFormatter: 'Megabytes D',
            color: '#d62728',
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
          }, {
            accessor: 'e',
            labelFormatter: 'Megabytes E',
            color: '#9467bd',
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
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          domain: [-10, undefined],
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
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
            labelFormatter: 'Label A',
            chart: 'StackedBarChart',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'StackedBarChart',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'd',
            labelFormatter: 'Megabytes D',
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
          formatter: formatter.toInteger,
          ticks: 5,
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
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
        valueFormatter: formatter.extendedISOTime,
      },

      dataConfig: [
        {
          accessor: 'a',
          labelFormatter: 'Label A',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'Label B',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          labelFormatter: 'Label C',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'd',
          labelFormatter: 'Label D',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'e',
          labelFormatter: 'Label E',
          valueFormatter: formatter.toInteger,
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
complexChartView.setData(complexData)
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
