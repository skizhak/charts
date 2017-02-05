/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const _c = require('constants')
const formatter = require('formatter')
const dg = require('data-generator')
const data = dg.projectVNTraffic({vnCount: 4, flowCount: 50})

const radialColorScheme = _c.d3ColorScheme10

function pieDataParser (data) {
  _.each(data, (vn) => {
    //Data parser for pie
  })
  return data
}

function trimTime (data) {
  _.each(data, d => {
    //Data parser for pie
  })
  return data
}

function trafficStatsParser (data) {
  let tsData = []
  if (data.length > 1) {
    data = _.reduce(data, function (d1, d2) {
      _.each(d2['flows'], (flow, index) => {
        d1['flows'][index].inTraffic += flow.inTraffic
        d1['flows'][index].outTraffic += flow.outTraffic
        d1['flows'][index].inPacket += flow.inPacket
        d1['flows'][index].outPacket += flow.outPacket
      })
      return d1
    })
    tsData = data['flows']
  } else {
    tsData = data[0]['flows']
  }

  return tsData
}

const trafficPlotConfig = {
  x: {
    accessor: 'time',
    axis: 'x',
  },
  y: [
    {
      accessor: 'inTraffic',
      label: 'Traffic In',
      enabled: true,
      chart: 'BarChart',
      axis: 'y1',
    }, {
      accessor: 'outTraffic',
      label: 'Traffic Out',
      enabled: true,
      chart: 'BarChart',
      axis: 'y1',
    }, {
      accessor: 'inPacket',
      label: 'Packets In',
      enabled: true,
      chart: 'LineChart',
      axis: 'y2',
    }, {
      accessor: 'outPacket',
      label: 'Packets Out',
      enabled: true,
      chart: 'LineChart',
      axis: 'y2',
    }
  ]
}

const trafficPlotAxisConfig = {
  x: {
    formatter: formatter.extendedISOTime
  },
  y1: {
    position: 'left',
    label: 'Traffic',
    ticks: 4,
    formatter: formatter.byteFormatter,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    label: 'Packets',
    ticks: 4,
    formatter: formatter.commaGroupedInteger,
    labelMargin: 15,
  }
}

const chartConfigs = [
  {
    id: 'vn-pie',
    type: 'RadialChart',
    container: '#vn-pie',
    dataProvider: {
      config: {
        formatData: pieDataParser
      }
    },
    components: [{
      id: 'donut-chart-id',
      type: 'PieChart',
      config: {
        type: 'donut',
        radius: 120,
        chartWidth: 275,
        chartHeight: 275,
        colorScale: d3.scaleOrdinal().range([radialColorScheme[0], radialColorScheme[6], radialColorScheme[2], radialColorScheme[4]]), // eslint-disable-line no-undef
        serie: {
          getValue: serie => serie.vmiCount,
          getLabel: serie => serie.vnName,
          valueFormatter: formatter.commaGroupedInteger,
        },
        tooltip: 'tooltip-id',
        onClick: (data, el, chart) => {
          if (chart.el.id === 'vn-traffic') {
            chart.setData([data])
          }
        }
      },
    }, {
      id: 'tooltip-id',
      type: 'Tooltip',
      config: {
        dataConfig: [
          {
            accessor: 'vmiCount',
            labelFormatter: serie => serie.name,
            valueFormatter: formatter.commaGroupedInteger,
          },
        ],
      },
    }, {
      type: 'LegendUniversal',
      config: {
        sourceComponent: 'donut-chart-id',
      },
    }]
  },
  {
    id: 'vn-traffic',
    type: 'XYChart',
    container: '#vn-traffic',
    dataProvider: {
      config: {
        formatData: trafficStatsParser
      }
    },
    components: [{
      type: 'LegendPanel',
      config: {
        sourceComponent: 'compositey-chart-id',
        editable: {
          colorSelector: true,
          chartSelector: true
        },
        placement: 'horizontal',
        filter: true,
      },
    }, {
      id: 'compositey-chart-id',
      type: 'CompositeYChart',
      config: {
        marginLeft: 80,
        marginRight: 80,
        chartHeight: 275,
        xTicks: 6,
        possibleChartTypes: ['BarChart', 'LineChart'],
        plot: trafficPlotConfig,
        axis: trafficPlotAxisConfig
      }
    }, {
      type: 'Navigation',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        chartHeight: 175,
        plot: trafficPlotConfig,
        axis: _.merge({}, trafficPlotAxisConfig, {y1: {ticks: 1, label: ''}, y2: {ticks: 1, label: ''}}),
        selection: [50, 100],
        // We will use default onChangeSelection handler.
        // onChangeSelection: (dataProvider, chart) => {}
      }
    }]
  }
]

const chartView = new coCharts.charts.MultiChartView()
chartView.setConfig({
  id: 'grouped-parent-chart',
  type: 'MultiChart',
  container: '#grouped-parent-chart',
  components: [],
  // Child charts.
  charts: chartConfigs,
})

chartView.setData(data, {}, 'vn-pie')
chartView.setData(data, {}, 'vn-traffic')
chartView.render()
