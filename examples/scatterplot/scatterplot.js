/* global coCharts d3 */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value) // eslint-disable-line no-undef
}
function numberFormatter (number) {
  return number.toFixed(2)
}

const complexData = []
for (let i = 0; i < 100; i++) {
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    data1: (Math.random() - 0.5) * 50,
    data2: Math.random() * 100,
    data3: Math.random() * 100,
    size1: Math.random() * 10,
    size2: Math.random() * 20,
    nav: (Math.random() - 0.5) * 50,
  })
}

const staticData = []
for (let i = 0; i < 10; i++) {
  staticData.push({
    x: 1475760930000 + 1000000 * i,
    data1: (i - 0.5) * 50,
    data2: i * 100,
    data3: i * 100,
    size1: i * 10,
    size2: i * 20,
    nav: (i - 0.5) * 50,
  })
}

const chartConfig = {
  container: '#chart',
  components: [{
    type: 'legendPanel',
    config: {
      sourceComponent: 'scatterPlot',
    },
  }, {
    id: 'scatterPlot',
    type: 'compositeY',
    config: {
      marginInner: 25,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'data1',
            chart: 'scatterPlot',
            sizeAccessor: 'size1',
            sizeAxis: 'sizeAxis',
            shape: 'circle',
            axis: 'y1',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 'data2',
            chart: 'scatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: 'square',
            axis: 'y2',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 'data3',
            chart: 'scatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: 'triangle',
            axis: 'y2',
            tooltip: 'tooltipId',
          }
        ]
      },
      axis: {
        sizeAxis: {
          range: [1, 500]
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
          labelMargin: 15,
        }
      },
    }
  }, {
    id: 'tooltipId',
    type: 'tooltip',
    config: {
      title: 'BUBBLE',
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'Time',
          valueFormatter: timeFormatter,
        }, {
          accessor: 'data1',
          labelFormatter: 'Data1',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'data2',
          labelFormatter: 'Data2',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'data3',
          labelFormatter: 'Data3',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'size1',
          labelFormatter: 'Size1',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'size2',
          labelFormatter: 'Size2',
          valueFormatter: numberFormatter,
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
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'nav',
            chart: 'line',
            axis: 'y1',
          }
        ]
      },
      axis: {
        y1: {
          position: 'left',
          formatter: numberFormatter,
          labelMargin: 15,
        },
      }
    }
  }]
}

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(complexData)
