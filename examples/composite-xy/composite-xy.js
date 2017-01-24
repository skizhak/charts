/* global d3 coCharts */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function numberFormatter (number) {
  return number.toFixed(2)
}
function numberFormatter3 (number) {
  return number.toFixed(3)
}

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
    type: 'LegendPanelView',
    config: {
      sourceComponent: 'complexChartCompositeY',
      placement: 'row',
      coloPicker: true,
      filter: true,
      chartSelector: true,
    },
  }, {
    type: 'ControlPanelView',
    config: {
      menu: [
        { id: 'refresh' },
      ],
    },
  }, {
    id: 'complexChartCompositeY',
    type: 'CompositeYChartView',
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
            labelFormatter: 'A',
            enabled: true,
            chart: 'StackedBarChartView',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarView'
              }, {
                label: 'Bar',
                chart: 'BarChartView'
              }, {
                label: 'Line',
                chart: 'LineChartView'
              }
            ],
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'B',
            enabled: true,
            chart: 'StackedBarChartView',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChartView'
              }, {
                label: 'Bar',
                chart: 'BarChartView'
              }, {
                label: 'Line',
                chart: 'LineChartView'
              }
            ],
            axis: 'y1',
            tooltip: 'customTooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'C',
            enabled: false,
            chart: 'StackedBarChartView',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChartView'
              }, {
                label: 'Bar',
                chart: 'BarChartView'
              }, {
                label: 'Line',
                chart: 'LineChartView'
              }
            ],
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'd',
            labelFormatter: 'Megabytes',
            color: '#d62728',
            enabled: true,
            chart: 'LineChartView',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChartView'
              }, {
                label: 'Bar',
                chart: 'BarChartView'
              }, {
                label: 'Line',
                chart: 'LineChartView'
              }
            ],
            axis: 'y2',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            chart: 'LineChartView',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'StackedBarChartView'
              }, {
                label: 'Bar',
                chart: 'BarChartView'
              }, {
                label: 'Line',
                chart: 'LineChartView'
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
          formatter: numberFormatter,
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
          labelMargin: 15
        }
      }
    },
  }, {
    type: 'NavigationView',
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
            labelFormatter: 'A',
            chart: 'StackedBarChartView',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'b',
            labelFormatter: 'B',
            chart: 'StackedBarChartView',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'd',
            labelFormatter: 'Megabytes',
            chart: 'LineChartView',
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
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
          labelMargin: 15,
        }
      }
    },
  }, {
    id: 'defaultTooltip',
    type: 'TooltipView',
    config: {
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'Time',
          valueFormatter: timeFormatter,
        }, {
          accessor: 'a',
          labelFormatter: 'A',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'b',
          labelFormatter: 'B',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'c',
          labelFormatter: 'C',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'd',
          labelFormatter: 'D',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'e',
          labelFormatter: 'E',
          valueFormatter: numberFormatter,
        }
      ]
    },
  }, {
    id: 'customTooltip',
    type: 'TooltipView',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }, {
    id: 'messageView',
    type: 'MessageView',
    config: {
      enabled: true,
    }
  }, {
    id: 'crosshairId',
    type: 'CrosshairView',
    config: {
      tooltip: 'defaultTooltip',
    }
  }]
})
complexChartView.setData(complexData)
complexChartView.renderMessage({
  componentId: 'XYChartView',
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
