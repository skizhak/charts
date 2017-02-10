/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')

const formatter = commons.formatter
const _c = commons._c

const data = commons.fixture({
  length: 40,
  data: {
    x: {linear: true, range: [1475760930000, 1475800930000]},
    data1: {random: true, range: [0, 50], gap: true},
    data2: {random: true, range: [0, 100], repeat: true},
    data3: {random: true, range: [0, 100]},
    size1: {random: true, range: [0, 10]},
    size2: {random: true, range: [0, 20]},
    nav: {random: true, range: [0, 10]},
  },
})

const colorScheme = _c.bubbleColorScheme6
const bubbleShapes = _c.bubbleShapes

const chartConfig = {
  id: 'multi-shape-bubble',
  components: [
  {
    type: 'LegendPanel',
    config: {
      sourceComponent: 'multishape-bubble-chart',
      editable: {
        colorSelector: true,
      },
    },
  },
  {
    id: 'multishape-bubble-chart',
    type: 'CompositeYChart',
    config: {
      marginLeft: 50,
      marginRight: 50,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'data1',
            label: 'Data 1',
            chart: 'ScatterPlot',
            sizeAccessor: 'size1',
            sizeAxis: 'sizeAxis',
            // this is a circle symbol from fontawesome
            shape: bubbleShapes.circleFill,
            color: colorScheme[0],
            axis: 'y1',
            tooltip: 'tooltip-id',
          }, {
            enabled: true,
            accessor: 'data2',
            label: 'Data 2',
            chart: 'ScatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.square,
            color: colorScheme[4],
            axis: 'y2',
            tooltip: 'tooltip-id',
          }, {
            enabled: true,
            accessor: 'data3',
            label: 'Data 3',
            chart: 'ScatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.star,
            color: colorScheme[5],
            axis: 'y2',
            tooltip: 'tooltip-id',
          }
        ]
      },
      axis: {
        sizeAxis: {
          range: [1, 500]
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          label: 'Y value of circles',
        },
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
          label: 'Y value of Square and Star',
        }
      },
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'x',
        valueFormatter: formatter.extendedISOTime,
      },

      dataConfig: [
        {
          accessor: 'data1',
          labelFormatter: 'Circle',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'data2',
          labelFormatter: 'Square',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'data3',
          labelFormatter: 'Star',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'size1',
          labelFormatter: 'Size of Circle',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'size2',
          labelFormatter: 'Size of Square and Star',
          valueFormatter: formatter.toInteger,
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
          formatter: formatter.toInteger,
        },
      }
    }
  }]
}

const chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(data)
