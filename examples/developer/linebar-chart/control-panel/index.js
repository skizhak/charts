/* global coCharts */

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
    id: 'controlPanelId',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }, {
        id: 'Filter',
        component: 'filterId',
      }, {
        id: 'ColorPicker',
        component: 'colorPickerId',
      }],
    }
  }, {
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
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'customTooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            enabled: false,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'd',
            labelFormatter: 'Megabytes D',
            color: '#d62728',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
            tooltip: 'defaultTooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Megabytes E',
            color: '#9467bd',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
            tooltip: 'defaultTooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: coCharts.formatter.extendedISOTime
        },
        y1: {
          position: 'left',
          formatter: coCharts.formatter.toInteger,
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: coCharts.formatter.toFixed1,
          labelMargin: 15
        }
      }
    },
  }, {
    id: 'colorPickerId',
    type: 'ColorPicker',
    config: {
      sourceComponent: 'compositeYId',
      embedded: true,
    }
  }, {
    id: 'filterId',
    type: 'Filter',
    config: {
      sourceComponent: 'compositeYId',
      embedded: true,
    },
  }]
})
complexChartView.setData(complexData)
