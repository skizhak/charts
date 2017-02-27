/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {charts} from 'coCharts'
import {formatter, _c} from 'commons'
const lbColorScheme7 = _c.d3ColorScheme20

function dataProcesser (rawData) {
  const keyMapper = {
    'T': () => 'T',
    'vrouter': (id) => `${id}.key`,
    'sum(packets)': (id) => `${id}.sum_packets`,
    'sum(bytes)': (id) => `${id}.sum_bytes`,
  }

  const _kernel = _.partialRight(_.mapKeys,
    (val, key, obj) => {
      const _key = obj['vrouter']
      return keyMapper[key] ? keyMapper[key](_key) : `${_key}.${key}`
    }
  )

  return {
    data: _.map(
      _.groupBy(_.map(rawData, (val) => _kernel(val)), 'T'),
      (val) => _.reduce(val, (merged, curr) => _.merge(merged, curr), {})
    ),
    nodeIds: _.uniq(_.map(rawData, 'vrouter'))
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

import dataSrc from './2vr-traffic.json'
const dataProcessed = dataProcesser(dataSrc.data)

const colorPalette = generateColorPalette(
  dataProcessed.nodeIds,
  ['sum_bytes', 'sum_packets'],
  lbColorScheme7,
  1,
  2
)

const mainChartPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    accessor: `${nodeId}.sum_bytes`,
    label: `Sum(Bytes) ${nodeId}`,
    enabled: true,
    chart: 'AreaChart',
    color: colorPalette[`${nodeId}.sum_bytes`],
    axis: 'y1',
  }, {
    accessor: `${nodeId}.sum_packets`,
    label: `Sum(Packets) ${nodeId}`,
    enabled: true,
    chart: 'LineChart',
    color: colorPalette[`${nodeId}.sum_packets`],
    axis: 'y2',
  })

  return config
}, [])

const navPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    enabled: true,
    accessor: `${nodeId}.sum_bytes`,
    chart: 'AreaChart',
    color: colorPalette[`${nodeId}.sum_bytes`],
    axis: 'y1',
  }, {
    enabled: true,
    accessor: `${nodeId}.sum_packets`,
    chart: 'LineChart',
    color: colorPalette[`${nodeId}.sum_packets`],
    axis: 'y2',
  })

  return config
}, [])

const tooltipDataConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId) => {
  config.push({
    accessor: `${nodeId}.sum_bytes`,
    labelFormatter: `Sum(Bytes) ${nodeId} `,
    valueFormatter: formatter.byteFormatter,
  }, {
    accessor: `${nodeId}.sum_packets`,
    labelFormatter: `Sum(Packets) ${nodeId}`,
    valueFormatter: formatter.toInteger,
  })

  return config
}, [{
  accessor: 'T',
  labelFormatter: 'Time',
  valueFormatter: formatter.extendedISOTime,
}])

const container = 'vr-traffic'
const layoutMeta = {
  [container]: 'col-md-11'
}

const chartConfig = {
  id: container,
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'vr-traffic-compositey',
      palette: _c.lbColorScheme17,
      editable: {
        colorSelector: true,
        chartSelector: true
      },
      placement: 'horizontal',
      filter: true,
    }
  }, {
    id: 'vr-traffic-compositey',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 400,
      crosshair: 'crosshair-id',
      possibleChartTypes: {
        y1: ['AreaChart', 'LineChart'],
        y2: ['AreaChart', 'LineChart']
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
          label: 'Sum(Bytes)',
          formatter: formatter.byteFormatter,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          label: 'Sum(Packets)',
          formatter: formatter.toInteger,
          labelMargin: 15,
        }
      }
    }
  }, {
    id: 'vr-traffic-navigation',
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
    id: 'vrTrafficMessage',
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
const trafficView = new charts.XYChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    trafficView.setConfig(chartConfig)
    trafficView.setData(dataProcessed.data)
    trafficView.renderMessage({
      componentId: 'vr-traffic-compositey',
      action: 'once',
      messages: [{
        level: '',
        title: '',
        message: 'Loading ...',
      }]
    })
  },
  remove: () => {
    trafficView.remove()
  }
}
