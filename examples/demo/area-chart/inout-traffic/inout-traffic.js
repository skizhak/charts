/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const dataSrc = require('./inout-traffic.json')
const formatter = require('formatter')

function dataProcesser (rawData) {
  const keyMapper = {
    'T': () => 'T',
    'traffic_type': (id) => `${id}.key`,
    'sum(bytes)': (id) => `${id}.sum_bytes`,
  }

  const _kernel = _.partialRight(_.mapKeys,
    (val, key, obj) => {
      const _key = obj['traffic_type']
      return keyMapper[key] ? keyMapper[key](_key) : `${_key}.${key}`
    }
  )

  return {
    data: _.map(
      _.groupBy(_.map(rawData, (val) => _kernel(val)), 'T'),
      (val) => _.reduce(val, (merged, curr) => _.merge(merged, curr), {})
    ),
    nodeIds: _.uniq(_.map(rawData, 'traffic_type'))
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

_.each(dataSrc.data, function (data) {
  if (data.traffic_type.indexOf('out') !== -1) {
    data['sum(bytes)'] *= -1
    data['sum(packets)'] *= -1
  }
})

const dataProcessed = dataProcesser(dataSrc.data)

const fkColors = [
  '#fcc100',
  '#a88add',
  '#0cc2aa',
  '#6887ff',
]

const colorPalette = generateColorPalette(
  dataProcessed.nodeIds,
  ['sum_bytes'],
  fkColors,
  1,
  2,
  1
)

const mainChartPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    accessor: `${nodeId}.sum_bytes`,
    label: `Sum(Bytes) ${nodeId}`,
    enabled: (nodeId.indexOf('in') !== -1),
    chart: 'AreaChart',
    possibleChartTypes: [
      {
        label: 'Line',
        chart: 'LineChart'
      },
      {
        label: 'Area',
        chart: 'AreaChart',
      }
    ],
    color: colorPalette[`${nodeId}.sum_bytes`],
    axis: 'y1',
  })
  return config
}, [])

const navPlotYConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId, idx) => {
  config.push({
    enabled: true,
    accessor: `${nodeId}.sum_bytes`,
    // labelFormatter: 'Sum(Bytes)',
    chart: 'AreaChart',
    color: colorPalette[`${nodeId}.sum_bytes`],
    axis: 'y1',
  })

  return config
}, [])

const tooltipDataConfig = _.reduce(dataProcessed.nodeIds, (config, nodeId) => {
  config.push({
    accessor: `${nodeId}.sum_bytes`,
    labelFormatter: `${nodeId} Sum(Bytes)`,
    valueFormatter: formatter.byteFormatter,
  })

  return config
}, [{
  accessor: 'T',
  labelFormatter: 'Time',
  valueFormatter: formatter.extendedISOTime,
}])

// Create chart view.
const trafficView = new coCharts.charts.XYChartView()
trafficView.setConfig({
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
          formatter: formatter.extendedISOTime
        },
        y1: {
          position: 'left',
          label: 'Sum(Bytes)',
          formatter: formatter.byteFormatter,
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
          formatter: formatter.extendedISOTime
        },
        y1: {
          position: 'left',
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
trafficView.setData(dataProcessed.data)
trafficView.renderMessage({
  componentId: 'XYChart',
  action: 'once',
  messages: [{
    level: 'info',
    title: '',
    message: 'Loading ...',
  }]
})
