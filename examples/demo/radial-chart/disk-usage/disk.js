/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import 'coCharts'
import commons from 'commons'

const formatter = commons.formatter
const _c = commons._c
const radialColorScheme6 = _c.radialColorScheme6

const osdStatusData = [
  {label: 'Disks Up', value: 59},
  {label: 'Disks Down', value: 4}
]
const osdClusterData = [
  {label: 'Disks In', value: 55},
  {label: 'Disks Out', value: 6}
]

function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

const container = ['disk-status-chart', 'disk-cluster-chart']
const layoutMeta = {
  [container[0]]: 'render-order-1 col-md-6',
  [container[1]]: 'render-order-2 col-md-6'
}

const diskStatusConfig = {
  id: container[0],
  type: 'RadialChart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-chart-1',
    type: 'PieChart',
    config: {
      type: 'donut',
      radius: 130,
      colorScale: d3.scaleOrdinal().range(radialColorScheme6.slice(0, 2)), // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.commaGroupedInteger,
      },
      tooltip: 'tooltip-id',
    },
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: getLabel,
          valueFormatter: formatter.commaGroupedInteger,
        },
      ],
    },
  }, {
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'donut-chart-1',
    },
  }]
}
const diskClusterConfig = {
  id: container[1],
  type: 'RadialChart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-chart-2',
    type: 'PieChart',
    config: {
      type: 'donut',
      radius: 130,
      colorScale: d3.scaleOrdinal().range(radialColorScheme6.slice(2)), // eslint-disable-line no-undef
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.commaGroupedInteger,
      },
      tooltip: 'tooltip-id',
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: getLabel,
          valueFormatter: formatter.commaGroupedInteger,
        },
      ],
    },
  }, {
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'donut-chart-2',
    },
  }]
}

const diskStatusChart = new coCharts.charts.RadialChartView()
const diskClusterChart = new coCharts.charts.RadialChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    diskStatusChart.setConfig(diskStatusConfig)
    diskClusterChart.setConfig(diskClusterConfig)

    diskStatusChart.setData(osdStatusData)
    diskClusterChart.setData(osdClusterData)
  },
  remove: () => {
    diskStatusChart.remove()
    diskClusterChart.remove()
  }
}
