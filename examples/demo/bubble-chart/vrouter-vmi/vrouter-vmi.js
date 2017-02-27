/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {charts} from 'coCharts'
import {formatter, _c} from 'commons'

const bubbleShapes = _c.bubbleShapes
const colorScheme = _c.bubbleColorScheme6

const vmiData = []

let cpu = 0
let data = {}
let vmi = 0
let count = 100
let vn = 0
let memory = 0

for (let i = 0; i < count; i++) {
  cpu = _.random(0, (i < 0.6 * count) ? 30 : ((i < 0.8 * count) ? 80 : 100))
  memory = (_.random(0, (i < 0.6 * count) ? 3 : ((i < 0.8 * count) ? 8 : 10))) * 10240000
  vmi = _.random(1, (i < 0.2 * count) ? 1000 : ((i < 0.8 * count) ? 700 : 300))
  vn = _.random(1, (i < 0.2 * count) ? 50 : ((i < 0.8 * count) ? 25 : 12))
  data = {
    name: 'vrouter' + (i + 1),
    cpu: cpu,
    size: _.random(0, 1000),
    vmi: vmi,
    vn: vn,
    memory: memory
  }
  vmiData.push(data)
}

const container = 'vrouter-vmi-chart'
const layoutMeta = {
  [container]: 'col-md-12'
}

const chartConfig = {
  id: container,
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
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 400,
        plot: {
          x: {
            accessor: 'vmi',
            axis: 'x',
            label: 'Interfaces'
          },
          y: [
            {
              enabled: true,
              accessor: 'vn',
              chart: 'ScatterPlot',
              label: 'vRouters',
              sizeAccessor: 'size',
              sizeAxis: 'sizeAxis',
              shape: bubbleShapes.certificate,
              axis: 'y1',
              color: colorScheme[3],
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
            range: [100, 500]
          },
          y1: {
            position: 'left',
            formatter: formatter.toInteger,
            label: 'Virtual Networks',
          }
        },
      }
    }, {
      id: 'tooltip-id',
      type: 'Tooltip',
      config: {
        title: 'vRouter Memory & CPU',

        dataConfig: [
          {
            accessor: 'name',
            labelFormatter: 'vRouter'
          },
          {
            accessor: 'vmi',
            labelFormatter: 'Interfaces',
            valueFormatter: formatter.toInteger
          },
          {
            accessor: 'vn',
            labelFormatter: 'Virtual Networks',
            valueFormatter: formatter.toInteger
          },
          {
            accessor: 'cpu',
            labelFormatter: 'CPU Share(%)',
            valueFormatter: formatter.toFixed1
          },
          {
            accessor: 'memory',
            labelFormatter: 'Memory',
            valueFormatter: formatter.byteFormatter
          }
        ]
      }
    }, {
      type: 'Navigation',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 250,
        selection: [50, 100],
        plot: {
          x: {
            accessor: 'cpu',
            label: 'CPU Share (%)',
            axis: 'x',
          },
          y: [
            {
              enabled: true,
              accessor: 'memory',
              chart: 'ScatterPlot',
              axis: 'y1',
              sizeAccessor: 'size',
              sizeAxis: 'sizeAxis',
              shape: bubbleShapes.square,
              color: colorScheme[5]
            }
          ]
        },
        axis: {
          x: {
            scale: 'scaleLinear',
            formatter: formatter.toFixed1
          },
          sizeAxis: {
            range: [50, 250]
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
    chartView.setData(vmiData)
  },
  remove: () => {
    chartView.remove()
  }
}
