/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const colorScheme = d3.schemeCategory10
const formatter = require('formatter')

const simpleData = []
const nodes = {
  compute: 25,
  control: 2,
  config: 2,
  webui: 2,
  collector: 2
}

let cpu = 0
let count = 0
let data = {}

for (var n in nodes) {
  count = nodes[n]
  for (let i = 0; i < count; i++) {
    cpu = _.random(0, 100)
    data = {
      cpu: cpu,
      size: Math.random() * 10
    }
    data[n] = Math.random() * 10000 * 1024
    simpleData.push(data)
  }
}

const chartConfig = {
  container: '#nodes-bubble-chart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'scatter-plot',
    },
  }, {
    id: 'scatter-plot',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
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
            shape: 'circle',
            axis: 'y1',
            color: colorScheme[0],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'control',
            chart: 'ScatterPlot',
            label: 'Control',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'star',
            axis: 'y1',
            color: colorScheme[1],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'config',
            chart: 'ScatterPlot',
            label: 'Config',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'diamond',
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
            shape: 'cross',
            axis: 'y1',
            color: colorScheme[3],
            tooltip: 'tooltip-id',
          },
          {
            enabled: true,
            accessor: 'webui',
            chart: 'ScatterPlot',
            label: 'WebUI',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'triangle',
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
          range: [100, 300]
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
      title: {
        accessor: 'cpu',
        valueFormatter: formatter.toFixed1,
      },

      dataConfig: [
        {
          accessor: 'size',
          labelFormatter: 'Size',
          valueFormatter: formatter.toInteger
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
      chartHeight: 200,
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
            shape: 'circle',
            color: colorScheme[0]
          },
          {
            enabled: true,
            accessor: 'control',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'star',
            color: colorScheme[5]
          },
          {
            enabled: true,
            accessor: 'config',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'diamond',
            color: colorScheme[2]
          },
          {
            enabled: true,
            accessor: 'collector',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'cross',
            color: colorScheme[4]
          },
          {
            enabled: true,
            accessor: 'webui',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'triangle',
            color: colorScheme[9]
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: formatter.toInteger
        },
        sizeAxis: {
          range: [50, 150]
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
