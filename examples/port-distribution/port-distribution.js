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
      outPkts: 0
    }, flattenedData[key])
  )
}

let dataSrc = require('./data-source.json')

dataSrc = dataProcesser(dataSrc)

const chartConfig = {
  container: '#chart',
  components: [{
    type: 'compositeY',
    config: {
      chartHeight: 600,
      marginInner: 25,
      rRange: [3, 20],
      plot: {
        x: {
          accessor: 'port',
          axis: 'x'
        },
        y: [
          {
            accessor: 'inBytes',
            chart: 'scatterPlot',
            sizeAccessor: 'inBytes',
            sizeAxis: 'rAxis',
            shape: 'circle',
            axis: 'y1'
          },
          {
            accessor: 'outBytes',
            chart: 'scatterPlot',
            sizeAccessor: 'outBytes',
            sizeAxis: 'rAxis',
            shape: 'triangle',
            axis: 'y2'
          }
        ]
      },
      axis: {
        x: {
          formatter: numberFormatter,
          labelMargin: 15
        },
        rAxis: {
          range: [3, 20]
        },
        y1: {
          position: 'left',
          formatter: byteFormatter,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: byteFormatter,
          labelMargin: 15
        }
      }
    }
  }, {
    type: 'tooltip',
    config: {
      title: 'BUBBLE',
      dataConfig: [
        {
          accessor: 'port',
          labelFormatter: function (key) {
            return 'Port'
          }
        },
        {
          accessor: 'inBytes',
          labelFormatter: function (key) {
            return 'Incoming Traffic'
          },
          valueFormatter: byteFormatter
        },
        {
          accessor: 'outBytes',
          labelFormatter: function (key) {
            return 'Outgoing Traffic'
          },
          valueFormatter: byteFormatter
        },
        {
          accessor: 'inFlowCount',
          labelFormatter: function (key) {
            return 'Incoming Flow Count'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 'outFlowCount',
          labelFormatter: function (key) {
            return 'Outgoing Flow Count'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 'inPkts',
          labelFormatter: function (key) {
            return 'Incoming Packets'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 'outPkts',
          labelFormatter: function (key) {
            return 'Outgoing Packets'
          },
          valueFormatter: numberFormatter
        }
      ]
    }
  }, {
    type: 'navigation',
    config: {
      marginInner: 5,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 'port',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'inBytes',
            chart: 'line',
            axis: 'y1',
          }
        ]
      },
      axis: {
        y1: {
          position: 'left',
          formatter: byteFormatter,
          labelMargin: 15,
        },
      }
    }
  }]
}

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(dataSrc)
