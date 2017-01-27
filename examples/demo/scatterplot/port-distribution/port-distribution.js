const d3 = require('d3')

function numberFormatter (number) {
  return Math.floor(number)
}

function byteFormatter (bytes) {
  const unit = 1000

  if (bytes < unit) {
    return bytes + ' B'
  }

  const scale = Math.floor(Math.log(bytes) / Math.log(unit))
  const unitPre = 'KMGTPE'.substr(scale - 1, 1)

  return `${Math.floor((bytes / Math.pow(unit, scale))).toFixed(0)} ${unitPre}B`
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
            accessor: 'inBytes',
            label: 'In Bytes',
            chart: 'ScatterPlot',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxisBytes',
            shape: 'circle',
            color: colorSchema[2],
            axis: 'y1',
            tooltip: 'defaultTooltip'
          },
          {
            accessor: 'outBytes',
            label: 'Out Bytes',
            chart: 'ScatterPlot',
            sizeAccessor: 'outBytes',
            sizeAxis: 'sizeAxisBytes',
            shape: 'circle',
            color: colorSchema[4],
            axis: 'y1',
            tooltip: 'defaultTooltip'
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          formatter: numberFormatter,
          labelMargin: 5
        },
        sizeAxisBytes: {
          range: [100, 150]
        },
        y1: {
          position: 'left',
          formatter: byteFormatter,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
          labelMargin: 15
        }
      }
    }
  }, {
    id: 'defaultTooltip',
    type: 'Tooltip',
    config: {
      title: 'Port Info',
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
          formatter: byteFormatter
        },
        sizeAxisBytes: {
          range: [100, 150]
        },
        y1: {
          position: 'left',
          formatter: byteFormatter,
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
