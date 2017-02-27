/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {charts} from 'coCharts'
import {formatter, _c} from 'commons'

const bubbleShapes = _c.bubbleShapes
const colorScheme = _c.bubbleColorScheme13

const nodeData = []
const nodes = {
  compute: 25,
  control: 2,
  config: 2,
  db: 2,
  collector: 2,
  webui: 2
}

let cpu = 0
let count = 0
let data = {}

for (var n in nodes) {
  count = nodes[n]
  for (let i = 0; i < count; i++) {
    cpu = _.random(0, (i < 0.7 * count) ? 30 : ((i < 0.8 * count) ? 80 : 100))
    data = {
      cpu: cpu,
      size: Math.random() * 10
    }
    data[n] = Math.random() * 10000 * 1024
    nodeData.push(data)
  }
}

const container = 'nodes-bubble-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'scatter-plot',
      palette: colorScheme,
      editable: {
        colorSelector: true,
        chartSelector: false
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    id: 'scatter-plot',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 400,
      plot: {
        x: {
          accessor: 'cpu',
          axis: 'x',
          label: 'CPU Share (%)'
        },
        y: [
          {
            enabled: true,
            accessor: 'compute',
            chart: 'ScatterPlot',
            label: 'Compute',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.certificate,
            axis: 'y1',
            color: colorScheme[7],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'control',
            chart: 'ScatterPlot',
            label: 'Control',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.dotCircle,
            axis: 'y1',
            color: colorScheme[6],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'config',
            chart: 'ScatterPlot',
            label: 'Config',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.cog,
            axis: 'y1',
            color: colorScheme[2],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'collector',
            chart: 'ScatterPlot',
            label: 'Collector',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.dashboard,
            axis: 'y1',
            color: colorScheme[1],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'db',
            chart: 'ScatterPlot',
            label: 'DB',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.db,
            axis: 'y1',
            color: colorScheme[0],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'webui',
            chart: 'ScatterPlot',
            label: 'WebUI',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.desktop,
            axis: 'y1',
            color: colorScheme[4],
            tooltip: 'tooltip-id',
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: formatter.toInteger
        },
        sizeAxis: {
          range: [200, 400]
        },
        y1: {
          position: 'left',
          formatter: formatter.byteFormatter,
          label: 'Memory',
        }
      },
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: 'Node Memory & CPU',

      dataConfig: [
        {
          accessor: 'cpu',
          labelFormatter: 'CPU Share',
          valueFormatter: formatter.toFixed1
        },
        {
          labelFormatter: 'Memory',
          valueFormatter: (point) => {
            let nodes = ['compute', 'control', 'config', 'collector', 'db', 'webui']
            let memory = '-'

            for (var i in nodes) {
              if (point[nodes[i]]) {
                memory = formatter.byteFormatter(point[nodes[i]])
                break
              }
            }

            return memory
          }
        }
      ]
    }
  }, {
    type: 'Navigation',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      chartHeight: 250,
      selection: [0, 100],
      plot: {
        x: {
          accessor: 'cpu',
          label: 'CPU Share (%)',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'compute',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.certificate,
            color: colorScheme[7]
          },
          {
            enabled: true,
            accessor: 'control',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.dotCircle,
            color: colorScheme[6]
          },
          {
            enabled: true,
            accessor: 'config',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.cog,
            color: colorScheme[2]
          },
          {
            enabled: true,
            accessor: 'collector',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.dashboard,
            color: colorScheme[1]
          },
          {
            enabled: true,
            accessor: 'db',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.db,
            color: colorScheme[0]
          },
          {
            enabled: true,
            accessor: 'webui',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.desktop,
            color: colorScheme[4]
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: formatter.toInteger
        },
        sizeAxis: {
          range: [75, 150]
        },
        y1: {
          position: 'left',
          label: 'Memory',
          formatter: formatter.byteFormatter,
          labelMargin: 15,
          ticks: 4
        }
      }
    }
  }]
}

const chartView = new charts.XYChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(nodeData)
  },
  remove: () => {
    chartView.remove()
  }
}
