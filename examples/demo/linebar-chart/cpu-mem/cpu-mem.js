/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import 'coCharts'
import commons from 'commons'
import dataSrc from './cpu-mem.json'

const _ = commons._
const formatter = commons.formatter
const _c = commons._c
const lbColorScheme7 = _c.lbColorScheme7
const dataProcessed = dataProcesser(dataSrc.data)

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

/**
 * Try to use the given colorSchema to assign a color to each attribute of each node
 *
 * @param      {Array}  nodeIds      Array of node identifiers
 * @param      {Array}  nodeAttrs    Array of node attributes to color
 * @param      {Array}  colorSchema  The color schema
 * @param      {number} offset1      The node index multiplier
 * @param      {number} offset2      The attribute index multiplier
 * @param      {number} base         The starting index of the colorSchema
 * @return     {Object}              Generated color palette
 */
function generateColorPalette (nodeIds, nodeAttrs, colorSchema, offset1, offset2 = 1, base = 0) {
  const colors = colorSchema.length

  return _.reduce(nodeIds, (palette, nodeId, nodeIdx) => {
    _.forEach(nodeAttrs, (attr, attrIdx) => {
      palette[`${nodeId}.${attr}`] = colorSchema[(nodeIdx * offset1 + attrIdx * offset2 + base) % colors]
    })

    return palette
  }, {})
}

const colorPalette = generateColorPalette(
    dataProcessed.nodeIds,
    ['cpu_share', 'mem_res'],
    lbColorScheme7,
    1,
    2,
    1
  )

const mainChartPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    accessor: `${nodeId}.cpu_share`,
    label: `${nodeId} CPU Utilization (%)`,
    enabled: true,
    chart: 'BarChart',
    color: colorPalette[`${nodeId}.cpu_share`],
    axis: 'y1',
  }, {
    accessor: `${nodeId}.mem_res`,
    label: `${nodeId} Memory Usage`,
    enabled: true,
    chart: 'LineChart',
    color: colorPalette[`${nodeId}.mem_res`],
    axis: 'y2',
  })
  return config
}, [])

const navPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    enabled: true,
    accessor: `${nodeId}.cpu_share`,
    // labelFormatter: 'CPU Utilization (%)',
    chart: 'BarChart',
    color: colorPalette[`${nodeId}.cpu_share`],
    axis: 'y1',
  }, {
    enabled: true,
    accessor: `${nodeId}.mem_res`,
    // labelFormatter: 'Memory Usage',
    chart: 'LineChart',
    color: colorPalette[`${nodeId}.mem_res`],
    axis: 'y2',
  })

  return config
}, [])

const tooltipDataConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId) => {
  config.push({
    accessor: `${nodeId}.cpu_share`,
    labelFormatter: `${nodeId} CPU Share`,
    valueFormatter: formatter.toFixedPercentage1,
  }, {
    accessor: `${nodeId}.mem_res`,
    labelFormatter: `${nodeId} Memory Usage`,
    valueFormatter: formatter.byteFormatter,
  })

  return config
}, [{
  accessor: 'T',
  labelFormatter: 'Time',
  valueFormatter: formatter.extendedISOTime,
}])

const container = 'cpu-mem-chart'
const layoutMeta = {
  [container]: 'col-md-11'
}

const chartConfig = {
  id: container,
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'cpu-mem-compositey',
      palette: _c.lbColorScheme7.concat(_c.d3ColorScheme20),
      editable: {
        colorSelector: true,
        chartSelector: true
      },
      placement: 'horizontal',
      filter: true,
    }
  }, {
    id: 'cpu-mem-compositey',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 400,
      crosshair: 'crosshair-id',
      possibleChartTypes: {
        y1: ['BarChart', 'LineChart'],
        y2: ['LineChart']
      },
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
          formatter: formatter.extendedISOTime
        },
        y1: {
          position: 'left',
          label: 'CPU Utilization (%)',
          formatter: formatter.toFixedPercentage1,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          label: 'Memory Usage',
          formatter: formatter.byteFormatter,
          labelMargin: 15,
        }
      }
    }
  }, {
    id: 'cpu-mem-navigation',
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
          formatter: formatter.extendedISOTime
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
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      title: 'Usage Details',
      dataConfig: tooltipDataConfig
    }
  }, {
    id: 'cpu-mem-controlpanel',
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
    id: 'cpu-mem-message',
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

// Create chart view.
const cpuMemChartView = new coCharts.charts.XYChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    cpuMemChartView.setConfig(chartConfig)
    cpuMemChartView.setData(dataProcessed.data)
    cpuMemChartView.renderMessage({
      componentId: 'cpu-mem-compositey',
      action: 'once',
      messages: [{
        level: '',
        title: '',
        message: 'Loading ...',
      }]
    })
  },
  remove: () => {
    cpuMemChartView.remove()
  }
}

