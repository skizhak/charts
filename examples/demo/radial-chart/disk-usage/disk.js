/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const osdStatusData = [
  {label: 'Disks Up', value: 59},
  {label: 'Disks Down', value: 4}
]

const osdClusterData = [
  {label: 'Disks In', value: 55},
  {label: 'Disks Out', value: 6}
]

const commons = require('commons')

const formatter = commons.formatter
const _c = commons._c

const radialColorScheme6 = _c.radialColorScheme6

function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

const diskStatusConfig = {
  id: 'disk-status-chart',
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
  id: 'disk-cluster-chart',
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
diskStatusChart.setConfig(diskStatusConfig)
diskStatusChart.setData(osdStatusData)

const diskClusterChart = new coCharts.charts.RadialChartView()
diskClusterChart.setConfig(diskClusterConfig)
diskClusterChart.setData(osdClusterData)
