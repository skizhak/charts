function numberFormatter (number) {
  return number
}

function byteFormatter (bytes) {
  const unit = 1000

  if (bytes < unit) {
    return bytes + ' B'
  }

  const scale = Math.floor(Math.log(bytes) / Math.log(unit))
  const unitPre = 'KMGTPE'.substr(scale - 1, 1)

  return `${Math.floor((bytes / Math.pow(unit, scale))).toFixed(1)} ${unitPre}B`
}

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
      outPkts: 0,
    }, flattenedData[key])
  )
}

let dataSrc = require('./data-source.json')

dataSrc = dataProcesser(dataSrc)

const chartConfig = {
  container: '#chart',
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
          axis: 'x',
          label: 'Port'
        },
        y: [
          {
            enabled: true,
            accessor: 'inBytes',
            label: 'In Bytes',
            chart: 'ScatterPlot',
            sizeAccessor: 'inBytes',
            sizeAxis: 'sizeAxis',
            shape: 'circle',
            axis: 'y1',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 'outBytes',
            chart: 'ScatterPlot',
            label: 'Out Bytes',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxis',
            shape: 'triangle',
            axis: 'y2',
            tooltip: 'tooltipId',
          }
        ]
      },
      axis: {
        x: {
          formatter: numberFormatter,
          labelMargin: 5
        },
        sizeAxis: {
          range: [3, 500]
        },
        y1: {
          position: 'left',
          formatter: byteFormatter,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          formatter: byteFormatter,
          labelMargin: 15,
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
          valueFormatter: byteFormatter,
        }, {
          accessor: 'outBytes',
          labelFormatter: 'Outgoing Traffic',
          valueFormatter: byteFormatter,
        }, {
          accessor: 'inFlowCount',
          labelFormatter: 'Incoming Flow Count',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'outFlowCount',
          labelFormatter: 'Outgoing Flow Count',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'inPkts',
          labelFormatter: 'Incoming Packets',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'outPkts',
          labelFormatter: 'Outgoing Packets',
          valueFormatter: numberFormatter,
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
            axis: 'y1',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxis',
            shape: 'circle',
          }
        ]
      },
      axis: {
        x: {},
        sizeAxis: {
          range: [3, 500],
        },
        y1: {
          position: 'left',
          formatter: byteFormatter,
          labelMargin: 15,
        }
      }
    }
  }]
}

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(dataSrc)