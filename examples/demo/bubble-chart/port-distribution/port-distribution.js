/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const d3 = require('d3')
const formatter = require('formatter')
const _c = require('constants')

const bubbleShapes = _c.bubbleShapes

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
        chartHeight: 450,
        marginInner: 10,
        marginLeft: 100,
        marginRight: 80,
        marginBottom: 60,
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
              label: 'Port Traffic In',
              chart: 'ScatterPlot',
              sizeAccessor: 'outBytes',
              sizeAxis: 'sizeAxisBytes',
              shape: bubbleShapes.signin,
              color: colorScheme[1],
              axis: 'y1',
              tooltip: 'tooltip-id',
            }, {
              enabled: true,
              accessor: 'outBytes',
              label: 'Port Traffic Out',
              chart: 'ScatterPlot',
              sizeAccessor: 'outBytes',
              sizeAxis: 'sizeAxisBytes',
              shape: bubbleShapes.signout,
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
        }
      }
    }, {
      id: 'tooltip-id',
      type: 'Tooltip',
      config: {
        title: 'Port Traffic',
        dataConfig: [
          {
            accessor: 'port',
            labelFormatter: 'Port Number',
          }, {
            accessor: 'inBytes',
            labelFormatter: 'Traffic In',
            valueFormatter: formatter.byteFormatter,
          }, {
            accessor: 'outBytes',
            labelFormatter: 'Traffic Out',
            valueFormatter: formatter.byteFormatter,
          }, {
            accessor: 'inFlowCount',
            labelFormatter: 'Incoming Flow Count',
            valueFormatter: formatter.toInteger,
          }, {
            accessor: 'outFlowCount',
            labelFormatter: 'Outgoing Flow Count',
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
        marginBottom: 60,
        chartHeight: 250,
        selection: [75, 100],
        plot: {
          x: {
            accessor: 'inBytes',
            label: 'Port Traffic In',
            axis: 'x',
          },
          y: [
            {
              enabled: true,
              accessor: 'outBytes',
              label: 'Port Traffic Out',
              chart: 'ScatterPlot',
              axis: 'y1',
              sizeAccessor: 'outBytes',
              sizeAxis: 'sizeAxisBytes',
              shape: bubbleShapes.circleFill,
              color: colorScheme[0],
            }
          ]
        },
        axis: {
          x: {
            scale: 'scaleLinear',
            formatter: formatter.byteFormatter,
          },
          sizeAxisBytes: {
            range: [100, 200],
          },
          y1: {
            position: 'left',
            formatter: formatter.byteFormatter,
            labelMargin: 15,
            ticks: 4,
          }
        }
      }
    }]
}

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(dataSrc)
