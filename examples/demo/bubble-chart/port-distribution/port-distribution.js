const d3 = require('d3')

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

const colorSchema = d3.schemeCategory20
let dataSrc = require('./data-source.json')

dataSrc = dataProcesser(dataSrc)

const chartConfig = {
  container: '#scatterChart',
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
            shape: 'circle',
            color: colorSchema[2],
            axis: 'y1',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 'outBytes',
            label: 'Out Bytes',
            chart: 'ScatterPlot',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxisBytes',
            shape: 'circle',
            color: colorSchema[4],
            axis: 'y1',
            tooltip: 'tooltipId',
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: coCharts.formatter.toInteger,
          labelMargin: 5
        },
        sizeAxisBytes: {
          range: [100, 150]
        },
        y1: {
          position: 'left',
          formatter: coCharts.formatter.byteFormatter,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          formatter: coCharts.formatter.toInteger,
          labelMargin: 15
        }
      }
    }
  }, {
    id: 'tooltipId',
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
          valueFormatter: coCharts.formatter.byteFormatter,
        }, {
          accessor: 'outBytes',
          labelFormatter: 'Outgoing Traffic',
          valueFormatter: coCharts.formatter.byteFormatter,
        }, {
          accessor: 'inFlowCount',
          labelFormatter: 'Incoming Flow Count',
          valueFormatter: coCharts.formatter.toInteger,
        }, {
          accessor: 'outFlowCount',
          labelFormatter: 'Outgoing Flow Count',
          valueFormatter: coCharts.formatter.toInteger,
        }, {
          accessor: 'inPkts',
          labelFormatter: 'Incoming Packets',
          valueFormatter: coCharts.formatter.toInteger,
        }, {
          accessor: 'outPkts',
          labelFormatter: 'Outgoing Packets',
          valueFormatter: coCharts.formatter.toInteger,
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
            shape: 'circle',
            color: colorSchema[8]
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: coCharts.formatter.byteFormatter
        },
        sizeAxisBytes: {
          range: [100, 150]
        },
        y1: {
          position: 'left',
          formatter: coCharts.formatter.byteFormatter,
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
