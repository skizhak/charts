/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')

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
    ticks: 5,
    formatter: formatter.toFixed1,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    label: '',
    ticks: 5,
    formatter: formatter.toFixed1,
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
    ticks: 5,
    formatter: formatter.byteFormatter1K,
    labelMargin: 15,
  },
  y2: {
    position: 'right',
    ticks: 5,
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
    label: 'Time'
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
  id: 'disk-usage',
  type: 'RadialChart',
  dataProvider: {
    config: {
      formatter: pieDataParser
    }
  },
  components: [{
    id: 'pie-chart-id',
    type: 'PieChart',
    config: {
      type: 'pie',
      radius: 120,
      chartWidth: 225,
      chartHeight: 225,
      colorScale: d3.scaleOrdinal().range([colorScheme[5], colorScheme[6]]), // eslint-disable-line no-undef
      serie: {
        getValue: serie => serie.value,
        getLabel: serie => serie.fieldName,
        valueFormatter: formatter.byteFormatter1K,
      },
      tooltip: 'pie-tooltip-id'
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
          valueFormatter: formatter.byteFormatter1K
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
  id: 'node-cpu',
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: cpuStatsParser
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
            valueFormatter: formatter.toNumber
          },
          {
            accessor: 'AVG(fifteen_min_avg)',
            labelFormatter: 'Avg CPU (15 mins)',
            valueFormatter: formatter.toNumber
          },
          {
            accessor: 'AVG(five_min_avg)',
            labelFormatter: 'Avg CPU (5 mins)',
            valueFormatter: formatter.toNumber
          },
          {
            accessor: 'AVG(one_min_avg)',
            labelFormatter: 'Avg CPU (1 min)',
            valueFormatter: formatter.toNumber
          }
        ],
      },
    },
    {
      id: 'compositey-chart-id',
      type: 'CompositeYChart',
      config: {
        marginLeft: 60,
        marginRight: 60,
        chartHeight: 300,
        crosshair: 'cpu-crosshair-id',
        xTicks: 5,
        possibleChartTypes: ['BarChart', 'LineChart'],
        plot: cpuPlotConfig,
        axis: cpuAxisConfig
      }
    },
    {
      id: 'cpu-crosshair-id',
      type: 'Crosshair',
      config: {
        tooltip: 'cpu-tooltip-id',
      }
    }]
}

const areaChartConfig = {
  id: 'node-mem',
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: memStatsParser
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
            valueFormatter: formatter.byteFormatter1K
          },
          {
            accessor: 'AVG(used)',
            labelFormatter: 'Used',
            valueFormatter: formatter.byteFormatter1K
          },
          {
            accessor: 'AVG(free)',
            labelFormatter: 'Free',
            valueFormatter: formatter.byteFormatter1K
          },
          {
            accessor: 'AVG(cached)',
            labelFormatter: 'Cached',
            valueFormatter: formatter.byteFormatter1K
          },
          {
            accessor: 'AVG(buffers)',
            labelFormatter: 'Buffers',
            valueFormatter: formatter.byteFormatter1K
          },
        ],
      },
    },
    {
      id: 'mem-chart-id',
      type: 'CompositeYChart',
      config: {
        marginLeft: 110,
        marginRight: 80,
        chartHeight: 300,
        crosshair: 'mem-crosshair-id',
        xTicks: 5,
        possibleChartTypes: ['BarChart', 'AreaChart'],
        plot: memPlotConfig,
        axis: memAxisConfig
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
  id: 'node-flow',
  type: 'XYChart',
  dataProvider: {
    config: {
      formatter: processFlowParser
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
            valueFormatter: formatter.toNumber
          },
          {
            accessor: 'AVG(added_flows)',
            labelFormatter: 'Added Flows',
            valueFormatter: formatter.toNumber
          },
          {
            accessor: 'AVG(deleted_flows)',
            labelFormatter: 'Deleted Flows',
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
        marginRight: 60,
        chartHeight: 275,
        crosshair: 'flow-crosshair-id',
        xTicks: 5,
        possibleChartTypes: ['BarChart', 'LineChart'],
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
    },
    {
      id: 'flow-crosshair-id',
      type: 'Crosshair',
      config: {
        tooltip: 'flow-tooltip-id',
      }
    }]
}

const bubbleChartConfig = {
  id: 'process-cpu-mem',
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
        chartHeight: 300,
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
            labelMargin: 5
          },
          sizeAxisBytes: {
            range: [200, 400]
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
          },
          {
            accessor: 'AVG(process_cpu_share)',
            labelFormatter: 'AVG CPU Share',
          },
          {
            accessor: 'AVG(process_mem_res)',
            labelFormatter: 'Avg Memory Res',
            valueFormatter: formatter.byteFormatter1K,
          },
          {
            accessor: 'AVG(process_mem_virt)',
            labelFormatter: 'Avg Memory Virt',
            valueFormatter: formatter.byteFormatter1K,
          }
        ]
      }
    }
  ]
}

const chartConfigs = [ pieChartConfig, lbChartConfig1, bubbleChartConfig , areaChartConfig, lbChartConfig2]
const chartView = new coCharts.charts.MultiChartView()

chartView.setConfig({
  id: 'grouped-parent-chart',
  type: 'MultiChart',
  components: [],
  charts: chartConfigs,
})

chartView.setData(data, {}, 'disk-usage')
chartView.setData(data, {}, 'process-cpu-mem')
chartView.setData(data, {}, 'node-cpu')
chartView.setData(data, {}, 'node-mem')
chartView.setData(data, {}, 'node-flow')

chartView.render()


let runner = null
onVisibilityChange()
function run () {
  now += timeInterval
  let newDataPoint = commons.dg.computeNodeData({vrCount: 1, count: 1, flowCount: 1, timeInterval: timeInterval, now: now})

  newDataPoint[0].systemCPU = data[0].systemCPU.slice(1).concat(newDataPoint[0].systemCPU)
  newDataPoint[0].systemMemory = data[0].systemMemory.slice(1).concat(newDataPoint[0].systemMemory)
  newDataPoint[0].flowRate = data[0].flowRate.slice(1).concat(newDataPoint[0].flowRate)

  data = newDataPoint

  chartView.setData(newDataPoint, {}, 'disk-usage')
  chartView.setData(newDataPoint, {}, 'process-cpu-mem')
  chartView.setData(newDataPoint, {}, 'node-cpu')
  chartView.setData(newDataPoint, {}, 'node-mem')
  chartView.setData(newDataPoint, {}, 'node-flow')

  chartView.render()
}

function onVisibilityChange () {
  if (document.hidden) {
    clearInterval(runner)
  } else {
    runner = setInterval(run, timeInterval)
  }
}

document.addEventListener('visibilitychange', onVisibilityChange, false)

