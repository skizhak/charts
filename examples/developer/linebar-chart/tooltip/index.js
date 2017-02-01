/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function numberFormatter (number) {
  return number.toFixed(0)
}
function numberFormatter3 (number) {
  return number.toFixed(1)
}
const complexData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: i + (Math.random() - 0.5) * 10,
  })
}
const complexChartView = new coCharts.charts.XYChartView()
complexChartView.setConfig({
  container: '#chart',
  components: [{
    id: 'compositeYId',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'defaultTooltipId',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'customTooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Megabytes C',
            color: 'grey',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
            tooltip: 'defaultTooltipId',
          }
        ]
      },
      axis: {
        x: {
          formatter: d3.timeFormat('%H:%M:%S')
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          domain: [-10, undefined],
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
        },
      },
    },
  }, {
    id: 'defaultTooltipId',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'Time',
          valueFormatter: timeFormatter,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
          valueFormatter: numberFormatter,
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
          valueFormatter: numberFormatter,
        }
      ]
    },
  }, {
    id: 'customTooltip',
    type: 'Tooltip',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }]
})
complexChartView.setData(complexData)
