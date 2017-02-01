/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const colorScheme = d3.schemeCategory10
const simpleData = []

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value) // eslint-disable-line no-undef
}
function numberFormatter (number) {
  return number.toFixed(0)
}

for (let i = 0; i < 40; i++) {
  simpleData.push({
    x: 1475760930000 + 1000000 * i,
    data1: Math.random() * 50,
    data2: Math.random() * 100,
    data3: Math.random() * 100,
    size1: Math.random() * 10,
    size2: Math.random() * 20,
    nav: Math.random() * 10,
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
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'data1',
            chart: 'ScatterPlot',
            sizeAccessor: 'size1',
            sizeAxis: 'sizeAxis',
            shape: 'circle',
            color: colorScheme[0],
            axis: 'y1',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 'data2',
            chart: 'ScatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: 'square',
            color: colorScheme[3],
            axis: 'y2',
            tooltip: 'tooltipId',
          }, {
            enabled: true,
            accessor: 'data3',
            chart: 'ScatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: 'triangle',
            color: colorScheme[2],
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
          label: 'Size of circles',
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
          label: 'Size of squares and triangles',
        }
      },
    }
  }, {
    id: 'tooltipId',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'x',
        valueFormatter: timeFormatter,
      },

      dataConfig: [
        {
          accessor: 'data1',
          labelFormatter: 'Label 1',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'data2',
          labelFormatter: 'Label 2',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'data3',
          labelFormatter: 'Label 3',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'size1',
          labelFormatter: 'Size 1',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'size2',
          labelFormatter: 'Size 2',
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
            color: colorScheme[1],
            axis: 'y1',
          }
        ]
      },
      axis: {
        y1: {
          position: 'left',
          formatter: numberFormatter,
        },
      }
    }
  }]
}

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(simpleData)
