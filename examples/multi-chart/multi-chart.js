/* global coCharts */

const complexData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 10
  })
}

const chartConfigs = [
  {
    chartId: 'chart1',
    type: 'XYChartView',
    container: '#chart1',
    components: [{
      type: 'compositeY',
      config: {
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'a',
              enabled: true,
              chart: 'bar',
              axis: 'y',
            }, {
              accessor: 'b',
              enabled: true,
              chart: 'bar',
              axis: 'y',
            }
          ]
        },
        axis: {
          x: {},
          y: {},
        }
      }
    }]
  }, {
    chartId: 'chart2',
    type: 'XYChartView',
    container: '#chart2',
    components: [{
      type: 'compositeY',
      config: {
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'c',
              enabled: true,
              chart: 'line',
              axis: 'y',
            }
          ]
        }
      },
    }, {
      type: 'navigation',
      config: {
        chartHeight: 200,
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'c',
              enabled: true,
              chart: 'line',
              axis: 'y',
            }
          ]
        }
      }
    }]
  }
]

const chartView = new coCharts.charts.MultiChartView()
chartView.setConfig({
  chartId: 'parentChart',
  handlers: [{
    type: 'bindingHandler',
    config: {
      bindings: [
        {
          sourceChart: 'chart2',
          sourceComponent: 'navigation',
          sourceModel: 'events',
          sourcePath: 'windowChanged',
          targetChart: 'chart1',
          targetComponent: 'compositeY',
          targetModel: 'config',
          action: function (sourceModel, targetModel, xMin, xMax) {
            const axis = targetModel.get('axis') || {}
            axis.x = axis.x || {}
            axis.x.domain = [xMin, xMax]
            targetModel.set({ axis: axis }, { silent: true })
            targetModel.trigger('change')
          }
        }
      ]
    }
  }],
  components: [], // Parent Chart components
  charts: chartConfigs // Child charts.
})
chartView.setData(complexData, {}, 'chart1')
chartView.setData(complexData, {}, 'chart2')
chartView.render()
