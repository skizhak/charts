/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const _c = require('constants')
const formatter = require('formatter')
const dg = require('data-generator')
const data = dg.projectVNTraffic({vnCount: 4, flowCount: 50})

const colorScheme = _c.d3ColorScheme10
const bubbleShapes = _c.bubbleShapes

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

function portStatsParser (data) {
  let tsData = []

  for (let k = 0; k < data.length; k++) {
    tsData = tsData.concat(data[k].ports)
  }
  return tsData
}

const trafficPlotConfig = {
  x: {
    accessor: 'time',
    axis: 'x',
    label: 'Time'
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
    formatter: formatter.extendedISOTime,
    label: 'Time'
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
        marginBottom: 60,
        colorScale: d3.scaleOrdinal().range([colorScheme[0], colorScheme[6], colorScheme[2], colorScheme[4]]), // eslint-disable-line no-undef
        serie: {
          getValue: serie => serie.vmiCount,
          getLabel: serie => serie.vnName,
          valueFormatter: formatter.commaGroupedInteger,
        },
        tooltip: 'tooltip-id',
        onClick: (data, el, chart) => {
          if (chart.el.id === 'vn-traffic' || chart.el.id === 'vn-ports') {
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
  },
  {
    id: 'vn-ports',
    type: 'XYChart',
    container: '#vn-ports',
    dataProvider: {
      config: {
        formatData: portStatsParser
      }
    },
    components: [
      {
        type: 'LegendPanel',
        config: {
          sourceComponent: 'scatter-plot',
          palette: _c.bubbleColorScheme13,
          editable: {
            colorSelector: true,
            chartSelector: false
          },
          placement: 'horizontal',
          filter: false,
        }
      },
      {
        id: 'scatter-plot',
        type: 'CompositeYChart',
        config: {
          chartHeight: 360,
          marginLeft: 90,
          plot: {
            x: {
              accessor: 'port',
              label: 'Port',
              axis: 'x',
            },
            y: [
              {
                enabled: true,
                accessor: 'inTraffic',
                label: 'Port Traffic In',
                chart: 'ScatterPlot',
                sizeAccessor: 'outBytes',
                sizeAxis: 'sizeAxisBytes',
                shape: bubbleShapes.signin,
                color: colorScheme[1],
                axis: 'y1',
                tooltip: 'port-tooltip-id',
              }, {
                enabled: true,
                accessor: 'outTraffic',
                label: 'Port Traffic Out',
                chart: 'ScatterPlot',
                sizeAccessor: 'outBytes',
                sizeAxis: 'sizeAxisBytes',
                shape: bubbleShapes.signout,
                color: colorScheme[2],
                axis: 'y1',
                tooltip: 'port-tooltip-id',
              }
            ]
          },
          axis: {
            x: {
              scale: 'scaleLinear',
              formatter: formatter.toInteger,
              labelMargin: 5
            },
            sizeAxisBytes: {
              range: [200, 400]
            },
            y1: {
              position: 'left',
              formatter: formatter.byteFormatter,
              labelMargin: 15,
            },
          }
        }
      }, {
        id: 'port-tooltip-id',
        type: 'Tooltip',
        config: {
          title: 'Port Traffic',
          dataConfig: [
            {
              accessor: 'vnName',
              labelFormatter: 'Virtual Network',
            },
            {
              accessor: 'port',
              labelFormatter: 'Port Number',
            }, {
              accessor: 'inTraffic',
              labelFormatter: 'Traffic In',
              valueFormatter: formatter.byteFormatter,
            }, {
              accessor: 'outTraffic',
              labelFormatter: 'Traffic Out',
              valueFormatter: formatter.byteFormatter,
            }
          ]
        }
      }
    ]
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
chartView.setData(data, {}, 'vn-ports')
chartView.setData(data, {}, 'vn-traffic')
chartView.render()
