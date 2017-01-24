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
    c: (Math.random() - 0.5) * 50,
    s: Math.random() * 100,
    t: Math.random() * 100,
    r: Math.random() * 10,
    nav: (Math.random() - 0.5) * 50,
  })
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
      marginInner: 25,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'c',
            chart: 'ScatterPlot',
            sizeAccessor: 'r',
            sizeAxis: 'rAxis',
            shape: 'circle',
            axis: 'y1',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 's',
            chart: 'ScatterPlot',
            sizeAccessor: 's',
            sizeAxis: 'rAxis',
            shape: 'square',
            axis: 'y2',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 't',
            chart: 'ScatterPlot',
            sizeAccessor: 's',
            sizeAxis: 'rAxis',
            shape: 'triangle',
            axis: 'y2',
            tooltip: 'tooltipId',
          }
        ]
      },
      axis: {
        rAxis: {
          range: [3, 50]
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
    type: 'Tooltip',
    config: {
      title: 'BUBBLE',
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'Time',
          valueFormatter: timeFormatter,
        }, {
          accessor: 'c',
          labelFormatter: 'C',
          valueFormatter: numberFormatter,
        }, {
          accessor: 's',
          labelFormatter: 'S',
          valueFormatter: numberFormatter,
        }, {
          accessor: 't',
          labelFormatter: 'T',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'r',
          labelFormatter: 'R',
          valueFormatter: numberFormatter,
        }
      ]
    }
  }, {
    type: 'Navigation',
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
            chart: 'LineChart',
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
