/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const pieData = [
  {label: 'Disks In', value: 55},
  {label: 'Disks Out', value: 6},
  {label: 'Disks Up', value: 59},
  {label: 'Disks Down', value: 4}
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

const chartConfig = {
  id: 'disk-donut-chart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-chart',
    type: 'PieChart',
    config: {
      type: 'donut',
      radius: 150,
      colorScale: d3.scaleOrdinal().range(radialColorScheme6), // eslint-disable-line no-undef
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
      sourceComponent: 'donut-chart',
    },
  }
  ]
}
const chartView = new coCharts.charts.RadialChartView()
chartView.setConfig(chartConfig)
chartView.setData(pieData)
