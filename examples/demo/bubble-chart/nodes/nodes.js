/* global coCharts d3 */

const _ = require('lodash')
const colorSchema = d3.schemeCategory10
const formatter = require('formatter')

const simpleData = []
const nodes = {
  compute: 25,
  control: 2,
  config: 2,
  webui: 2,
  collector: 2
}

var cpu = 0
var count = 0
var data = {}

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
  container: '#chart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'scatterPlot',
    },
  }, {
    id: 'scatterPlot',
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
            color: colorSchema[0],
            tooltip: 'tooltipId',
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
            color: colorSchema[5],
            tooltip: 'tooltipId',
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
            color: colorSchema[2],
            tooltip: 'tooltipId',
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
            color: colorSchema[4],
            tooltip: 'tooltipId',
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
            color: colorSchema[9],
            tooltip: 'tooltipId',
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
    id: 'tooltipId',
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
            color: colorSchema[0]
          },
          {
            enabled: true,
            accessor: 'control',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'star',
            color: colorSchema[5]
          },
          {
            enabled: true,
            accessor: 'config',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'diamond',
            color: colorSchema[2]
          },
          {
            enabled: true,
            accessor: 'collector',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'cross',
            color: colorSchema[4]
          },
          {
            enabled: true,
            accessor: 'webui',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'size',
            sizeAxis: 'sizeAxis',
            shape: 'triangle',
            color: colorSchema[9]
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
