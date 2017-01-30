/* global coCharts */

const staticData = []
for (let i = 1; i <= 5; i++) {
  staticData.push({
    x: i,
    a: i * 3,
    b: i * 5,
    c: i * 7,
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
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Value',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'defaultTooltipId',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'defaultTooltipId',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            color: 'grey',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'defaultTooltipId',
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
        },
        y1: {
          domain: [0, 25],
          position: 'left',
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
          labelFormatter: 'Value',
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
        }
      ]
    },
  }]
})
complexChartView.setData(staticData)
