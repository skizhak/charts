/* global coCharts */

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
  handlers: [{
    type: 'bindingHandler',
    config: {
      bindings: [
        {
          sourceComponent: 'compositeY',
          sourceModel: 'config',
          sourcePath: 'plot',
          targetComponent: 'controlPanel',
          targetModel: 'config',
          action: 'sync'
        }
      ]
    },
  }],
  container: '#complexChart',
  components: [{
    type: 'legend',
    config: {
      sourceComponent: 'complexChartCompositeY'
    }
  }, {
    id: 'complexChartCompositeY',
    type: 'compositeY',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
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
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'B',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
            tooltip: 'customTooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'C',
            enabled: false,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'd',
            labelFormatter: 'Megabytes',
            color: '#d62728',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y2',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
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
    type: 'navigation',
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
            chart: 'stackedBar',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'b',
            labelFormatter: 'B',
            chart: 'stackedBar',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'd',
            labelFormatter: 'Megabytes',
            chart: 'line',
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
    type: 'tooltip',
    config: {
      sourceComponent: 'complexChartCompositeY',
      title: 'HI',
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
    type: 'tooltip',
    config: {
      template: function (data) {
        return '<div class="tooltip-content">Custom tooltip</div>'
      }
    }
  }, {
    id: 'complexChart-controlPanel',
    type: 'controlPanel',
    config: {
      enabled: true,
      buttons: [
        {
          name: 'filter',
          title: 'Filter',
          iconClass: 'fa fa-filter',
          events: {
            click: 'filterVariables'
          },
          panel: {
            name: 'accessorData',
            width: '350px'
          }
        }, {
          // This action button is to demonstrate the message component. May not reflect the correct use-case.
          name: 'sendMessage',
          title: 'Send Message',
          iconClass: 'fa fa-edit',
          events: {
            click: function () {
              this._eventObject.trigger('message', {
                componentId: 'XYChartView',
                action: 'new',
                messages: [
                  {
                    title: 'New Message',
                    message: 'A message was added.'
                  }
                ]
              })
            }
          }
        }, {
          name: 'clearMessage',
          title: 'Clear Message',
          iconClass: 'fa fa-eraser',
          events: {
            click: function () {
              this._eventObject.trigger('clearMessage', 'XYChartView')
            }
          }
        }, {
          name: 'refresh',
          title: 'Refresh',
          iconClass: 'fa fa-refresh',
          events: {
            click: function () {
              this._eventObject.trigger('refresh')
            }
          }
        }
      ]
    },
  }, {
    id: 'messageView',
    type: 'message',
    config: {
      enabled: true,
    }
  }, {
    type: 'crosshair',
    config: {
      tooltip: 'defaultTooltip',
    }
  }, {
    type: 'colorPicker',
    config: {
      sourceComponent: 'complexChartCompositeY',
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
