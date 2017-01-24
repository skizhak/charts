/* global d3 coCharts */

function numberFormatter (number) {
  return number.toFixed(2)
}
function numberFormatter3 (number) {
  return number.toFixed(3)
}

// Complex example
const complexData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 100,
    d: i + (Math.random() - 0.5) * 10,
    e: (Math.random() - 0.5) * 10,
  })
}
const complexChartView = new coCharts.charts.XYChartView()
complexChartView.setConfig({
  container: '#chart',
  components: [{
    type: 'ControlPanelView',
    config: {
      menu: [{
        id: 'Refresh',
      }, {
        id: 'FilterView',
        component: 'filterId',
      }, {
        id: 'ColorPickerView',
        component: 'colorPickerId',
      }],
    }
  }, {
    id: 'compositeYId',
    type: 'CompositeYChartView',
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
            labelFormatter: 'A',
            enabled: true,
            chart: 'StackedBarChartView',
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'B',
            enabled: true,
            chart: 'StackedBarChartView',
            axis: 'y1',
            tooltip: 'customTooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'C',
            enabled: false,
            chart: 'StackedBarChartView',
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'd',
            labelFormatter: 'Megabytes',
            color: '#d62728',
            enabled: true,
            chart: 'LineChartView',
            axis: 'y2',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            chart: 'LineChartView',
            axis: 'y2',
            tooltip: 'defaultTooltip',
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
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
          labelMargin: 15
        }
      }
    },
  }, {
    id: 'colorPickerId',
    type: 'ColorPickerView',
    config: {
      sourceComponent: 'compositeYId',
      embedded: true,
    }
  }, {
    id: 'filterId',
    type: 'FilterView',
    config: {
      sourceComponent: 'compositeYId',
      embedded: true,
    },
  }]
})
complexChartView.setData(complexData)
