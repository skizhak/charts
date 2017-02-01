/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const d3 = require('d3')
const formatter = require('formatter')

function dataProcesser (data) {
  const portTraffic = [...data.sport, ...data.dport]
  const flattenedData = portTraffic.reduce((flattened, currDataPoint) => {
    const port = (currDataPoint.sport || currDataPoint.dport)

    if (!flattened[port]) {
      flattened[port] = {}
    }

    Object.assign(flattened[port], currDataPoint)

    return flattened
  }, {})

  return Object.keys(flattenedData).map(
    (key) => Object.assign({
      port: +key,
      inBytes: 0,
      inFlowCount: 0,
      inPkts: 0,
      outBytes: 0,
      outFlowCount: 0,
      outPkts: 0
    }, flattenedData[key])
  )
}

const colorScheme = d3.schemeCategory10
let dataSrc = require('./port-distribution.json')

dataSrc = dataProcesser(dataSrc)

const chartConfig = {
  container: '#pd-bubble-chart',
  components: [{
    type: 'CompositeYChart',
    config: {
      chartHeight: 600,
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      plot: {
        x: {
          accessor: 'port',
          label: 'Port',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'inBytes',
            label: 'In Bytes',
            chart: 'ScatterPlot',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxisBytes',
            shape: '&larr;',
            color: colorScheme[1],
            axis: 'y1',
            tooltip: 'tooltip-id',
          }, {
            enabled: true,
            accessor: 'outBytes',
            label: 'Out Bytes',
            chart: 'ScatterPlot',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxisBytes',
            shape: '&rarr;',
            color: colorScheme[2],
            axis: 'y1',
            tooltip: 'tooltip-id',
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
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
          labelMargin: 15
        }
      }
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: 'Port Info',
      dataConfig: [
        {
          accessor: 'port',
          labelFormatter: 'Port',
        }, {
          accessor: 'inBytes',
          labelFormatter: 'Incoming Traffic',
          valueFormatter: formatter.byteFormatter,
        }, {
          accessor: 'outBytes',
          labelFormatter: 'Outgoing Traffic',
          valueFormatter: formatter.byteFormatter,
        }, {
          accessor: 'inFlowCount',
          labelFormatter: 'Incoming Flow Count',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'outFlowCount',
          labelFormatter: 'Outgoing Flow Count',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'inPkts',
          labelFormatter: 'Incoming Packets',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'outPkts',
          labelFormatter: 'Outgoing Packets',
          valueFormatter: formatter.toInteger,
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
      selection: [75, 100],
      plot: {
        x: {
          accessor: 'inBytes',
          label: 'In Bytes',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'outBytes',
            label: 'Out Bytes',
            chart: 'ScatterPlot',
            axis: 'y1',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxisBytes',
            shape: '&bigcirc;',
            color: colorScheme[4]
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: formatter.byteFormatter
        },
        sizeAxisBytes: {
          range: [100, 150]
        },
        y1: {
          position: 'left',
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
chartView.setData(dataSrc)
