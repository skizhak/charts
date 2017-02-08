/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')

const _ = commons._
const formatter = commons.formatter
const _c = commons._c

const data = commons.dg.projectVNTraffic({vnCount: 4, flowCount: 50})
const colorScheme = _c.d3ColorScheme20
const bubbleShapes = _c.bubbleShapes

function pieDataParser (data) {
  _.each(data, (vn) => {
    // Data parser for pie
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
      color: colorScheme[0],
      axis: 'y1',
      tooltip: 'xy-tooltip-id'
    }, {
      accessor: 'outTraffic',
      label: 'Traffic Out',
      enabled: true,
      chart: 'BarChart',
      color: colorScheme[2],
      axis: 'y1',
      tooltip: 'xy-tooltip-id'
    }, {
      accessor: 'inPacket',
      label: 'Packets In',
      enabled: true,
      chart: 'LineChart',
      color: colorScheme[1],
      axis: 'y2',
      tooltip: 'xy-tooltip-id'
    }, {
      accessor: 'outPacket',
      label: 'Packets Out',
      enabled: true,
      chart: 'LineChart',
      color: colorScheme[3],
      axis: 'y2',
      tooltip: 'xy-tooltip-id'
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

const groupedChartsWrapper = 'grouped-parent-chart'
const container = ['vn-pie', 'vn-traffic', 'vn-ports']
const layoutMeta = {
  'vn-pie': 'render-order-2 col-md-6',
  'vn-traffic': 'render-order-1 col-md-12',
  'vn-ports': 'render-order-3 col-md-6'
}

const chartConfigs = [
  {
    id: container[0],
    type: 'RadialChart',
    dataProvider: {
      config: {
        formatter: pieDataParser
      }
    },
    components: [{
      id: 'donut-chart-id',
      type: 'PieChart',
      config: {
        type: 'donut',
        radius: 130,
        chartWidth: 275,
        chartHeight: 275,
        marginBottom: 20,
        marginTop: 20,
        colorScale: d3.scaleOrdinal().range([colorScheme[4], colorScheme[6], colorScheme[7], colorScheme[8]]), // eslint-disable-line no-undef
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
            labelFormatter: 'VMI Count for VN',
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
    id: container[1],
    type: 'XYChart',
    dataProvider: {
      config: {
        formatter: trafficStatsParser
      }
    },
    components: [
      {
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
      },
      {
        id: 'xy-tooltip-id',
        type: 'Tooltip',
        config: {
          title: 'Traffic of selected VN',
          dataConfig: [
            {
              accessor: 'inTraffic',
              labelFormatter: 'Traffic In',
              valueFormatter: formatter.byteFormatter
            }, {
              accessor: 'outTraffic',
              labelFormatter: 'Traffic Out',
              valueFormatter: formatter.byteFormatter
            }, {
              accessor: 'inPacket',
              labelFormatter: 'Packets In',
              valueFormatter: formatter.toNumber
            }, {
              accessor: 'outPacket',
              labelFormatter: 'Packets Out',
              valueFormatter: formatter.toNumber
            }
          ],
        },
      },
      {
        id: 'compositey-chart-id',
        type: 'CompositeYChart',
        config: {
          marginLeft: 80,
          marginRight: 80,
          chartHeight: 275,
          crosshair: 'crosshair-id',
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
      },
      {
        id: 'crosshair-id',
        type: 'Crosshair',
        config: {
          tooltip: 'xy-tooltip-id',
        }
      }]
  },
  {
    id: container[2],
    type: 'XYChart',
    dataProvider: {
      config: {
        formatter: portStatsParser
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
          filter: true,
        }
      },
      {
        id: 'scatter-plot',
        type: 'CompositeYChart',
        config: {
          chartHeight: 350,
          marginLeft: 100,
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
                color: colorScheme[0],
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

const chartConfig = {
  id: groupedChartsWrapper,
  type: 'MultiChart',
  components: [],
  // Child charts.
  charts: chartConfigs,
}

let isInitialized = false
const chartView = new coCharts.charts.MultiChartView()

module.exports = {
  groupedChartsWrapper: groupedChartsWrapper,
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    if (!isInitialized) {
      isInitialized = true

      chartView.setConfig(chartConfig)

      _.forEach(container, (container) => {
        chartView.setData(data, {}, container)
      })
    }

    chartView.render()
  }
}
