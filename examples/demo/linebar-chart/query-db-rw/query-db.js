/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import 'coCharts'
import commons from 'commons'

const _ = commons._
const formatter = commons.formatter
const _c = commons._c

function getDataPoint (x) {
  const a = _.random(3, 100) * 100
  return {
    x: x,
    a: a,
    b: _.random(a, a + 1000),
    c: Math.ceil(_.random(3, 100)),
  }
}

let data = []
let now = _.now()

for (let i = 1; i <= 100; i++) {
  data.push(getDataPoint(now - ((100 - i) * 1000)))
}

const container = 'query-db-chart'
const layoutMeta = {
  [container]: 'col-md-11'
}

const chartConfig = {
  id: container,
  components: [{
    id: 'control-panel-id',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Freeze',
      }],
    }
  }, {
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
      possibleChartTypes: {
        y1: ['StackedBarChart', 'LineChart'],
        y2: ['LineChart']
      },
      crosshair: 'crosshair-id',
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
            axis: 'y1'
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
}

let intervalId = -1
const queryChart = new coCharts.charts.XYChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    queryChart.setConfig(chartConfig)
    queryChart.setData(data)
    queryChart.renderMessage({
      componentId: 'query-db-compositey',
      action: 'once',
      messages: [{
        level: 'info',
        title: 'Information',
        message: 'Chart has been loaded successfully.'
      }, {
        level: 'warn',
        title: 'Warning',
        message: 'This is an example of warning message. '
      }, {
        level: 'error',
        title: 'Error',
        message: 'This is an example of error message.'
      }]
    })
    clearInterval(intervalId)
    intervalId = setInterval(() => {
      now += 1000
      data.splice(0, 1)
      data = data.concat([getDataPoint(now)])
      queryChart.setData(data)
    }, 1000)
  },
  remove: () => {
    queryChart.remove()
  },
  stopUpdating: () => {
    clearInterval(intervalId)
    intervalId = -1
  }
}
