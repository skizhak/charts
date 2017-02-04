/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const formatter = require('formatter')

// const data = require('file?name=[name].[ext]&publicPath=./  &outputPath=js/!./vn-detail-all.json')
const data = require('./vn-detail-all.json')

function pieDataParser (data) {
  _.each(data, (vn) => {
    vn.vmi_count = vn.value.UveVirtualNetworkAgent.interface_list.length
  })
  return data
}

function trafficStatsParser (data) {
  let tsData = []
  if (data.length > 1) {
    data = _.reduce(data, function (d1, d2) {
      _.each(d2['flow-series'], (flow, index) => {
        d1['flow-series'][index].inBytes += flow.inBytes
        d1['flow-series'][index].outBytes += flow.outBytes
        d1['flow-series'][index].inPkts += flow.inPkts
        d1['flow-series'][index].outPkts += flow.outPkts
        d1['flow-series'][index].totalPkts += flow.totalPkts
        d1['flow-series'][index].totalBytes += flow.totalBytes
      })
      return d1
    })
    tsData = data['flow-series']
  } else {
    tsData = data[0]['flow-series']
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
      accessor: 'inBytes',
      enabled: true,
      chart: 'BarChart',
      axis: 'y1',
    }, {
      accessor: 'outBytes',
      enabled: true,
      chart: 'BarChart',
      axis: 'y1',
    }, {
      accessor: 'inPkts',
      enabled: true,
      chart: 'LineChart',
      axis: 'y2',
    }, {
      accessor: 'outPkts',
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
    label: 'Memory Usage',
    formatter: formatter.byteFormatter,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    label: 'Packets',
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
        radius: 100,
        chartWidth: 200,
        chartHeight: 300,
        colorScale: d3.scaleOrdinal().range(d3.schemeCategory20), // eslint-disable-line no-undef
        serie: {
          getValue: serie => serie.vmi_count,
          getLabel: serie => serie.name,
          valueFormatter: formatter.commaGroupedInteger,
        },
        tooltip: 'tooltip-id',
        onClick: (data, chart) => {
          if (chart.el.id === 'vn-traffic') chart.setData([].concat([data]))
        }
      },
    }, {
      id: 'tooltip-id',
      type: 'Tooltip',
      config: {
        dataConfig: [
          {
            accessor: 'vmi_count',
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
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 300,
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
        marginBottom: 40,
        chartHeight: 150,
        selection: [75, 100],
        plot: trafficPlotConfig,
        axis: _.merge(trafficPlotAxisConfig, {y1: {ticks: 2}, y2: {ticks: 2}})
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
