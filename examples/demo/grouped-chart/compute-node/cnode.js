/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import 'coCharts'
import commons from 'commons'

const _ = commons._
const formatter = commons.formatter
const _c = commons._c
const timeInterval = 2000

let now = _.now()
let data = commons.dg.computeNodeData({vrCount: 1, count: 20, flowCount: 60, timeInterval: timeInterval, now: now})

const colorScheme = _c.lbColorScheme17
const bubbleColorScheme = _c.bubbleColorScheme6
const bubbleShapes = _c.bubbleShapes

function pieDataParser (data) {
  return data[0]['diskUsage']
}

function cpuStatsParser (data) {
  return data[0]['systemCPU']
}

function memStatsParser (data) {
  return data[0]['systemMemory']
}

function processCPUMemParser (data) {
  return data[0]['processCPUMem']
}

function processFlowParser (data) {
  return data[0]['flowRate']
}

const groupedChartsWrapper = 'grouped-parent-chart'
const container = ['disk-usage', 'node-cpu', 'process-cpu-mem', 'node-mem', 'node-flow']
const layoutMeta = {
  [container[0]]: 'render-order-5 col-xs-12 col-md-3',
  [container[1]]: 'render-order-2 col-xs-12 col-md-5',
  [container[2]]: 'render-order-4 col-xs-12 col-md-8',
  [container[3]]: 'render-order-1 col-xs-12 col-md-6',
  [container[4]]: 'render-order-3 col-xs-11'
}

const cpuPlotConfig = {
  x: {
    accessor: 'time',
    axis: 'x',
    label: 'Time'
  },
  y: [
    {
      accessor: 'AVG(cpu_share)',
      label: 'Avg CPU Share',
      enabled: true,
      chart: 'LineChart',
      color: colorScheme[7],
      axis: 'y1'
    },
    {
      accessor: 'AVG(five_min_avg)',
      label: 'Avg CPU (5 mins)',
      enabled: true,
      chart: 'BarChart',
      color: colorScheme[4],
      axis: 'y2'
    },
    {
      accessor: 'AVG(one_min_avg)',
      label: 'Avg CPU (1 min)',
      enabled: true,
      chart: 'BarChart',
      color: colorScheme[1],
      axis: 'y2'
    }
  ]
}

const cpuAxisConfig = {
  x: {
    formatter: formatter.extendedISOTime,
    label: 'Time',
    ticks: 3,
  },
  y1: {
    position: 'left',
    label: '',
    ticks: 4,
    formatter: formatter.toInteger,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    label: '',
    ticks: 4,
    formatter: formatter.toInteger,
    labelMargin: 15,
  }
}

const memAxisConfig = {
  x: {
    formatter: formatter.extendedISOTime,
    label: 'Time',
    ticks: 3,
  },
  y1: {
    position: 'left',
    ticks: 4,
    formatter: formatter.byteFormatter1K,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    ticks: 4,
    formatter: formatter.byteFormatter1K,
    labelMargin: 15,
  }
}

const memPlotConfig = {
  x: {
    accessor: 'time',
    axis: 'x',
    label: 'Time'
  },
  y: [
    {
      accessor: 'AVG(free)',
      label: 'Free Memory',
      enabled: true,
      chart: 'LineChart',
      color: colorScheme[2],
      axis: 'y2'
    },
    {
      accessor: 'AVG(used)',
      label: 'Used Memory',
      enabled: true,
      chart: 'AreaChart',
      color: colorScheme[7],
      axis: 'y1'
    },
    {
      accessor: 'AVG(cached)',
      label: 'Cached Memory',
      enabled: true,
      chart: 'AreaChart',
      color: colorScheme[1],
      axis: 'y1'
    }
  ]
}

const flowPlotConfig = {
  x: {
    accessor: 'time',
    axis: 'x',
    label: 'Time'
  },
  y: [
    {
      accessor: 'AVG(added_flows)',
      label: 'Added Flows',
      enabled: true,
      chart: 'StackedBarChart',
      color: colorScheme[9],
      axis: 'y1'
    },
    {
      accessor: 'AVG(deleted_flows)',
      label: 'Deleted Flows',
      enabled: true,
      chart: 'StackedBarChart',
      color: colorScheme[7],
      axis: 'y1'
    },
    {
      accessor: 'AVG(active_flows)',
      label: 'Active Flows',
      enabled: true,
      chart: 'LineChart',
      color: colorScheme[8],
      axis: 'y2'
    }
  ]
}

const flowAxisConfig = {
  x: {
    formatter: formatter.extendedISOTime,
    label: 'Time',
    ticks: 5
  },
  y1: {
    position: 'left',
    ticks: 4,
    formatter: formatter.toNumber,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    ticks: 4,
    formatter: formatter.toNumber,
    labelMargin: 15,
  }
}

const pieChartConfig = {
  id: container[0],
  type: 'RadialChart',
  dataProvider: {
    config: {
      formatter: pieDataParser,
    }
  },
  components: [{
    id: 'pie-chart-id',
    type: 'PieChart',
    config: {
      type: 'pie',
      radius: 110,
      chartWidth: 225,
      chartHeight: 225,
      colorScale: d3.scaleOrdinal().range([colorScheme[5], colorScheme[6]]), // eslint-disable-line no-undef
      serie: {
        getValue: serie => serie.value,
        getLabel: serie => serie.fieldName,
        valueFormatter: formatter.byteFormatter1K,
      },
      tooltip: 'pie-tooltip-id',
    },
  }, {
    id: 'pie-tooltip-id',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: (dPoint) => {
            return dPoint.fieldName
          },
          valueFormatter: formatter.byteFormatter1K,
        },
      ],
    },
  }, {
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'pie-chart-id',
    },
  }]
}

const lbChartConfig1 = {
  id: container[1],
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: cpuStatsParser,
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
      id: 'cpu-tooltip-id',
      type: 'Tooltip',
      config: {
        title: 'CPU Usage',
        dataConfig: [
          {
            accessor: 'AVG(cpu_share)',
            labelFormatter: 'Avg CPU Share',
            valueFormatter: formatter.toNumber,
          }, {
            accessor: 'AVG(fifteen_min_avg)',
            labelFormatter: 'Avg CPU (15 mins)',
            valueFormatter: formatter.toNumber,
          }, {
            accessor: 'AVG(five_min_avg)',
            labelFormatter: 'Avg CPU (5 mins)',
            valueFormatter: formatter.toNumber,
          }, {
            accessor: 'AVG(one_min_avg)',
            labelFormatter: 'Avg CPU (1 min)',
            valueFormatter: formatter.toNumber,
          }
        ],
      },
    }, {
      id: 'compositey-chart-id',
      type: 'CompositeYChart',
      config: {
        marginLeft: 60,
        marginRight: 60,
        chartHeight: 300,
        crosshair: 'cpu-crosshair-id',
        possibleChartTypes: {
          y1: ['BarChart', 'LineChart'],
          y2: ['BarChart', 'LineChart']
        },
        plot: cpuPlotConfig,
        axis: cpuAxisConfig,
      }
    }, {
      id: 'cpu-crosshair-id',
      type: 'Crosshair',
      config: {
        tooltip: 'cpu-tooltip-id',
      }
    }]
}

const bubbleChartConfig = {
  id: container[2],
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: processCPUMemParser
    }
  },
  components: [
    {
      id: 'scatter-plot',
      type: 'CompositeYChart',
      config: {
        chartHeight: 320,
        marginLeft: 100,
        marginBottom: 60,
        plot: {
          x: {
            accessor: 'AVG(process_cpu_share)',
            label: 'Avg CPU Share for Process',
            axis: 'x',
          },
          y: [
            {
              enabled: true,
              accessor: 'AVG(process_mem_res)',
              label: 'Avg Memory for Process',
              chart: 'ScatterPlot',
              sizeAccessor: 'AVG(process_mem_virt)',
              sizeAxis: 'sizeAxisBytes',
              shape: bubbleShapes.sun,
              color: bubbleColorScheme[5],
              axis: 'y1',
              tooltip: 'pcpu-tooltip-id',
            }
          ]
        },
        axis: {
          x: {
            scale: 'scaleLinear',
            formatter: formatter.toFixed1,
            labelMargin: 5,
          },
          sizeAxisBytes: {
            range: [200, 400],
          },
          y1: {
            position: 'left',
            formatter: formatter.byteFormatter1K,
            ticks: 4,
            labelMargin: 15,
          },
        }
      }
    }, {
      id: 'pcpu-tooltip-id',
      type: 'Tooltip',
      config: {
        title: 'Process CPU Memory',
        dataConfig: [
          {
            accessor: 'process_name',
            labelFormatter: 'Process',
          }, {
            accessor: 'AVG(process_cpu_share)',
            labelFormatter: 'AVG CPU Share',
          }, {
            accessor: 'AVG(process_mem_res)',
            labelFormatter: 'Avg Memory Res',
            valueFormatter: formatter.byteFormatter1K,
          }, {
            accessor: 'AVG(process_mem_virt)',
            labelFormatter: 'Avg Memory Virt',
            valueFormatter: formatter.byteFormatter1K,
          }
        ]
      }
    }
  ]
}

const areaChartConfig = {
  id: container[3],
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: memStatsParser,
    }
  },
  components: [
    {
      type: 'LegendPanel',
      config: {
        sourceComponent: 'mem-chart-id',
        editable: {
          colorSelector: true,
          chartSelector: true
        },
        placement: 'horizontal',
        filter: true,
      },
    },
    {
      id: 'mem-tooltip-id',
      type: 'Tooltip',
      config: {
        title: 'Memory Usage',
        dataConfig: [
          {
            accessor: 'AVG(total)',
            labelFormatter: 'Total',
            valueFormatter: formatter.byteFormatter1K,
          }, {
            accessor: 'AVG(used)',
            labelFormatter: 'Used',
            valueFormatter: formatter.byteFormatter1K,
          }, {
            accessor: 'AVG(free)',
            labelFormatter: 'Free',
            valueFormatter: formatter.byteFormatter1K,
          }, {
            accessor: 'AVG(cached)',
            labelFormatter: 'Cached',
            valueFormatter: formatter.byteFormatter1K,
          }, {
            accessor: 'AVG(buffers)',
            labelFormatter: 'Buffers',
            valueFormatter: formatter.byteFormatter1K,
          },
        ],
      },
    },
    {
      id: 'mem-chart-id',
      type: 'CompositeYChart',
      config: {
        marginLeft: 90,
        marginRight: 70,
        chartHeight: 300,
        crosshair: 'mem-crosshair-id',
        possibleChartTypes: {
          y1: ['BarChart', 'LineChart'],
          y2: ['BarChart', 'LineChart']
        },
        plot: memPlotConfig,
        axis: memAxisConfig,
      }
    },
    {
      id: 'mem-crosshair-id',
      type: 'Crosshair',
      config: {
        tooltip: 'mem-tooltip-id',
      }
    }]
}

var lbChartConfig2 = {
  id: container[4],
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: processFlowParser,
    }
  },
  components: [
    {
      id: 'flow-tooltip-id',
      type: 'Tooltip',
      config: {
        title: 'VRouter Flows',
        dataConfig: [
          {
            accessor: 'AVG(active_flows)',
            labelFormatter: 'Active Flows',
            valueFormatter: formatter.toNumber,
          }, {
            accessor: 'AVG(added_flows)',
            labelFormatter: 'Added Flows',
            valueFormatter: formatter.toNumber,
          }, {
            accessor: 'AVG(deleted_flows)',
            labelFormatter: 'Deleted Flows',
            valueFormatter: formatter.toNumber,
          }
        ],
      },
    },
    {
      id: 'compositey-chart-id',
      type: 'CompositeYChart',
      config: {
        marginLeft: 60,
        marginRight: 50,
        chartHeight: 275,
        crosshair: 'flow-crosshair-id',
        plot: flowPlotConfig,
        axis: flowAxisConfig
      }
    }, {
      type: 'Navigation',
      config: {
        marginLeft: 80,
        marginRight: 60,
        chartHeight: 175,
        plot: flowPlotConfig,
        axis: _.merge({}, flowAxisConfig, {y1: {ticks: 1, label: ''}, y2: {ticks: 1, label: ''}}),
        selection: [50, 100],
        // We will use default onChangeSelection handler.
        // onChangeSelection: (dataProvider, chart) => {}
      }
    }, {
      id: 'flow-crosshair-id',
      type: 'Crosshair',
      config: {
        tooltip: 'flow-tooltip-id',
      }
    }]
}

const chartConfigs = [pieChartConfig, lbChartConfig1, bubbleChartConfig, areaChartConfig, lbChartConfig2]

const chartConfig = {
  id: groupedChartsWrapper,
  type: 'MultiChart',
  charts: chartConfigs,
  components: [
    //TODO: Fix the placement of control panel for multi-chart
    /*
    {
      id: 'control-panel-id',
      type: 'ControlPanel',
      config: {
        menu: [{
          id: 'Freeze',
        }],
      }
    }*/
  ]
}

let intervalId = -1
const chartView = new coCharts.charts.MultiChartView()

export default {
  groupedChartsWrapper: groupedChartsWrapper,
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    clearInterval(intervalId)
    const dataUpdate = () => {
      now += timeInterval
      let newDataPoint = commons.dg.computeNodeData({vrCount: 1, count: 1, flowCount: 1, timeInterval: timeInterval, now: now})

      newDataPoint[0].systemCPU = data[0].systemCPU.slice(1).concat(newDataPoint[0].systemCPU)
      newDataPoint[0].systemMemory = data[0].systemMemory.slice(1).concat(newDataPoint[0].systemMemory)
      newDataPoint[0].flowRate = data[0].flowRate.slice(1).concat(newDataPoint[0].flowRate)

      data = newDataPoint

      _.forEach(container, (container) => {
        chartView.setData(data, {}, container)
      })
    }
    chartView.setConfig(chartConfig)
    dataUpdate()
    intervalId = setInterval(dataUpdate, timeInterval)

    // chartView.render()
  },
  remove: () => {
    chartView.remove()
  },
  stopUpdating: () => {
    clearInterval(intervalId)
    intervalId = -1
  }
}
