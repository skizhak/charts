/* global d3 coCharts */

const _ = require('lodash')

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value / 1000)
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

function dataProcesser (rawData) {
  const keyMapper = {
    'T=': () => 'T',
    'process_mem_cpu_usage.__key': (id) => `${id}.key`,
    'SUM(process_mem_cpu_usage.cpu_share)': (id) => `${id}.cpu_share`,
    'SUM(process_mem_cpu_usage.mem_res)': (id) => `${id}.mem_res`,
    'SUM(process_mem_cpu_usage.mem_virt)': (id) => `${id}.mem_virt`
  }

  const _kernel = _.partialRight(_.mapKeys,
    (val, key, obj) => {
      const _key = obj['process_mem_cpu_usage.__key']
      return keyMapper[key] ? keyMapper[key](_key) : `${_key}.${key}`
    }
  )

  return {
    data: _.map(
      _.groupBy(_.map(rawData, (val) => _kernel(val)), 'T'),
      (val) => _.reduce(val, (merged, curr) => _.merge(merged, curr), {})
    ),
    nodeIds: _.uniq(_.map(rawData, 'process_mem_cpu_usage.__key'))
  }
}

const dataSrc = require('./data-source.json')
const dataProcessed = dataProcesser(dataSrc.data)
const colorSchema = d3.schemeCategory20

const mainChartPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    accessor: `${nodeId}.cpu_share`,
    label: 'CPU Utilization (%)',
    enabled: idx === 0,
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
    color: colorSchema[idx % 20],
    axis: 'y1',
  }, {
    accessor: `${nodeId}.mem_res`,
    label: 'Memory Usage',
    enabled: idx === 0,
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
    color: colorSchema[(idx + 4) % 20],
    axis: 'y2',
  })
  return config
}, [])

const navPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    enabled: idx === 0,
    accessor: `${nodeId}.cpu_share`,
    labelFormatter: 'CPU',
    chart: 'StackedBarChart',
    color: '#6baed6',
    axis: 'y1',
  }, {
    enabled: idx === 0,
    accessor: `${nodeId}.mem_res`,
    labelFormatter: 'Memory',
    chart: 'LineChart',
    color: '#2ca02c',
    axis: 'y2',
  })

  return config
}, [])

const tooltipDataConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId) => {
  config.push({
    accessor: `${nodeId}.cpu_share`,
    labelFormatter: `${nodeId} CPU Share`,
    valueFormatter: cpuFormatter,
  }, {
    accessor: `${nodeId}.mem_res`,
    labelFormatter: `${nodeId} Memory Usage`,
    valueFormatter: memFormatter,
  })

  return config
}, [{
  accessor: 'T',
  labelFormatter: 'Time',
  valueFormatter: timeFormatter,
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
        y: mainChartPlotYConfig
      },
      axis: {
        x: {
          formatter: timeFormatter
        },
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
        y: navPlotYConfig
      },
      axis: {
        x: {
          formatter: timeFormatter
        },
        y1: {
          position: 'left',
          formatter: () => '',
          labelMargin: 15,
          ticks: 4,
        },
        y2: {
          position: 'right',
          formatter: () => '',
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
      tooltip: 'defaultTooltip',
    }
  }]
})
cpuMemChartView.setData(dataProcessed.data)
cpuMemChartView.renderMessage({
  componentId: 'XYChart',
  action: 'once',
  messages: [{
    level: 'info',
    title: '',
    message: 'Loading ...',
  }]
})
