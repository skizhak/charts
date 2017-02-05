/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const formatter = require('formatter')
const _c = require('constants')

const bubbleShapes = _c.bubbleShapes
const colorScheme = _c.bubbleColorScheme6

//const simpleData = require('./vrouter-vmi.json')

const simpleData = []

let cpu = 0
let data = {}
let vmi = 0
let count = 100
let vn = 0
let memory = 0

for (let i = 0; i < count; i++) {
    cpu = _.random(0, (i < .6 * count) ? 30 : ((i < .8 * count) ? 80 : 100))
    memory = (_.random(0, (i < .6 * count) ? 3 : ((i < .8 * count) ? 8 : 10)))* 10240000
    vmi = _.random(1, (i < .2 * count) ? 1000 : ((i < .8 * count) ? 700 : 300))
    vn = _.random(1, (i < .2 * count) ? 50 : ((i < .8 * count) ? 25 : 12))
    data = {
      name: 'vrouter' + (i + 1),
      cpu: cpu,
      size: _.random(0, 1000),
      vmi: vmi,
      vn: vn,
      memory: memory
    }
    simpleData.push(data)
}

const chartConfig = {
  container: '#vrouter-vmi-chart',
  components: [
    {
      type: 'LegendPanel',
      config: {
        sourceComponent: 'scatter-plot',
        palette: _c.bubbleColorScheme14,
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
        chartHeight: 500,
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
              color: colorScheme[1],
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
            label: 'Virtual Networks3',
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
            labelFormatter: 'Virtual Networks2',
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
        selection: [80, 100],
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

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(simpleData)
