/* global _ d3 coCharts */

const _ = require('lodash')

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

const nodes = ['node1', 'node2', 'node3', 'node4']
const colorMapper = _.zipObject(
  nodes,
  [{
    cpu: '#6baed6',
    mem: '#4398cb'
  }, {
    cpu: '#2ca02c',
    mem: '#217821'
  }, {
    cpu: '#a02c2c',
    mem: '#782121'
  }, {
    cpu: '#fc9ad8',
    mem: '#fb68c5'
  }]
)

// Time series data.
const tsData = []
for (let i = 0; i < 100; i++) {
  tsData.push(nodes.reduce((newDataPoint, currNode) => {
    return Object.assign(newDataPoint, {
      [`${currNode}.cpu_stats.cpu_one_min_avg`]: Math.random() * 100, // Value between 0-100
      [`${currNode}.cpu_stats.rss`]: Math.random() * (8 * 1048576 - 1024) + 1024, // Value between 8GB - 1MB
    })
  }, {
    'T': 1475760930000 + 1000000 * i
  }))
}

const chartYPlotConfig = nodes.reduce((config, currNode) => {
  config.push({
    accessor: `${currNode}.cpu_stats.cpu_one_min_avg`,
    label: `${currNode} CPU Utilization (%)`,
    enabled: true,
    chart: 'StackedBarChart',
    possibleChartTypes: [
      {
        label: 'Stacked Bar',
        chart: 'StackedBarChart',
      }, {
        label: 'Line',
        chart: 'LineChart',
      }
    ],
    color: colorMapper[currNode].cpu,
    axis: 'y1',
  }, {
    accessor: `${currNode}.cpu_stats.rss`,
    label: `${currNode} Memory Usage`,
    enabled: true,
    chart: 'LineChart',
    possibleChartTypes: [
      {
        label: 'Stacked Bar',
        chart: 'StackedBarChart',
      }, {
        label: 'Line',
        chart: 'LineChart'
      }
    ],
    color: colorMapper[currNode].mem,
    axis: 'y2',
  })

  return config
}, [])

const navYPlotConfig = nodes.reduce((config, currNode) => {
  config.push({
    enabled: true,
    accessor: `${currNode}.cpu_stats.cpu_one_min_avg`,
    labelFormatter: 'CPU',
    chart: 'StackedBarChart',
    color: colorMapper[currNode].cpu,
    axis: 'y1',
  }, {
    enabled: true,
    accessor: `${currNode}.cpu_stats.rss`,
    labelFormatter: 'Memory',
    chart: 'LineChart',
    color: colorMapper[currNode].mem,
    axis: 'y2',
  })

  return config
}, [])

const tooltipDataConfig = nodes.reduce((config, currNode) => {
  config.push({
    accessor: `${currNode}.cpu_stats.cpu_one_min_avg`,
    labelFormatter: 'CPU',
    valueFormatter: cpuFormatter
  }, {
    accessor: `${currNode}.cpu_stats.rss`,
    labelFormatter: 'Memory',
    valueFormatter: memFormatter
  })

  return config
}, [{
  accessor: 'T',
  labelFormatter: 'Time',
  valueFormatter: timeFormatter
}])

// Create chart view.
const cpuMemChartView = new coCharts.charts.XYChartView()
cpuMemChartView.setConfig({
  container: '#cpuMemChart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'cpuMemCompositeY',
    }
  }, {
    id: 'cpuMemCompositeY',
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
          accessor: 'T',
          label: 'Time',
          axis: 'x',
        },
        y: chartYPlotConfig
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
    id: 'cpuMemChart-navigation',
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
          accessor: 'T',
          labelFormatter: 'Time',
          axis: 'x',
        },
        y: navYPlotConfig
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
    type: 'Tooltip',
    config: {
      title: 'Usage Details',
      dataConfig: tooltipDataConfig
    }
  }, {
    id: 'cpuMemChart-controlPanel',
    type: 'ControlPanel',
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
    type: 'Standalone',
    config: {
      isSharedContainer: false,
    },
  }, {
    id: 'cpuMemChart-message',
    type: 'Message',
    config: {
      enabled: true,
    }
  }, {
    id: 'crosshairId',
    type: 'Crosshair',
    config: {
      tooltip: 'defaultTooltip'
    }
  }, {
    type: 'ColorPicker',
    config: {
      sourceComponent: 'cpuMemCompositeY',
    }
  }]
})
cpuMemChartView.setData(tsData)
cpuMemChartView.renderMessage({
  componentId: 'XYChart',
  action: 'once',
  messages: [{
    level: 'info',
    title: '',
    message: 'Loading ...',
  }]
})
