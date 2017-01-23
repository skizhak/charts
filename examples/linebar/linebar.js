/* global coCharts */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function cpuFormatter (number) {
  return number.toFixed(2) + '%'
}
function memFormatter (number) {
  const bytePrefixes = ['B', 'KB', 'MB', 'GB', 'TB']
  let bytes = parseInt(number * 1024)
  let formattedBytes = '-'
  _.each(bytePrefixes, (prefix, idx) => {
    if (bytes < 1024) {
      formattedBytes = bytes.toFixed(2) + ' ' + prefix
      return false
    } else {
      if (idx === bytePrefixes.length - 1) {
        formattedBytes = bytes.toFixed(2) + ' ' + prefix
      } else {
        bytes = bytes / 1024
      }
    }
  })
  return formattedBytes
}

// Time series data.
const tsData = []
for (let i = 0; i < 100; i++) {
  tsData.push({
    'T': 1475760930000 + 1000000 * i,
    'cpu_stats.cpu_one_min_avg': Math.random() * 100, // Value between 0-100
    'cpu_stats.rss': Math.random() * (8 * 1048576 - 1024) + 1024, // Value between 8GB - 1MB
  })
}

// Create chart view.
const cpuMemChartView = new coCharts.charts.XYChartView()
cpuMemChartView.setConfig({
  container: '#cpuMemChart',
  components: [{
    type: 'legend',
    config: {
      sourceComponent: 'cpuMemCompositeY'
    }
  }, {
    id: 'cpuMemCompositeY',
    type: 'compositeY',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      crosshair: 'crosshairId',
      plot: {
        x: {
          accessor: 'T',
          label: 'Time',
          axis: 'x',
        },
        y: [
          {
            accessor: 'cpu_stats.cpu_one_min_avg',
            label: 'CPU Utilization (%)',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar',
              }, {
                label: 'Line',
                chart: 'line',
              }
            ],
            color: '#6baed6',
            axis: 'y1',
          }, {
            accessor: 'cpu_stats.rss',
            label: 'Memory Usage',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar',
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            color: '#2ca02c',
            axis: 'y2',
          }
        ]
      },
      axis: {
        x: {},
        y1: {
          position: 'left',
          formatter: cpuFormatter,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          formatter: memFormatter,
          labelMargin: 15,
        }
      }
    }
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
          accessor: 'T',
          labelFormatter: 'Time',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'cpu_stats.cpu_one_min_avg',
            labelFormatter: 'CPU',
            chart: 'stackedBar',
            color: '#6baed6',
            axis: 'y1',
          }, {
            enabled: true,
            accessor: 'cpu_stats.rss',
            labelFormatter: 'Memory',
            chart: 'line',
            color: '#2ca02c',
            axis: 'y2',
          }
        ]
      },
      axis: {
        x: {},
        y1: {
          position: 'left',
          formatter: cpuFormatter,
          labelMargin: 15,
          ticks: 4,
        },
        y2: {
          position: 'right',
          formatter: memFormatter,
          labelMargin: 15,
          ticks: 4,
        }
      }
    }
  }, {
    id: 'defaultTooltip',
    type: 'tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'T',
          labelFormatter: 'Time',
          valueFormatter: timeFormatter,
        }, {
          accessor: 'cpu_stats.cpu_one_min_avg',
          labelFormatter: 'CPU',
          valueFormatter: cpuFormatter,
        }, {
          accessor: 'cpu_stats.rss',
          labelFormatter: 'Memory',
          valueFormatter: memFormatter,
        }
      ]
    }
  }, {
    id: 'cpuMemChart-controlPanel',
    type: 'controlPanel',
    config: {
      enabled: true,
      buttons: [
        {
          name: 'filter',
          title: 'Filter',
          iconClass: 'fa fa-filter',
          events: {
            click: 'filterVariables',
          },
          panel: {
            name: 'accessorData',
            width: '350px',
          }
        }
      ]
    }
  }, {
    type: 'standalone',
    config: {
      isSharedContainer: false,
    },
  }, {
    type: 'message',
    config: {
      enabled: true,
    }
  }, {
    id: 'crosshairId',
    type: 'crosshair',
    config: {
    }
  }, {
    type: 'colorPicker',
    config: {
      sourceComponent: 'cpuMemCompositeY',
    }
  }]
})
cpuMemChartView.setData(tsData)
cpuMemChartView.renderMessage({
  componentId: 'XYChartView',
  action: 'once',
  messages: [{
    level: 'info',
    title: '',
    message: 'Loading ...',
  }]
})
