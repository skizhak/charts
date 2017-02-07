/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')
const _c = commons._c

const colorScheme = _c.lbColorScheme7
const simpleData = []

let now = _.now()

for (let i = 0; i < 100; i++) {
  simpleData.push({
    x: now - (i * 60000),
    a: _.random(10, 100),
    b: _.random(10, 100),
    c: _.random(400, 450),
    d: _.random(200, 300),
  })
}

const chartConfigs = [
  {
    id: 'grouped-chart1',
    type: 'XYChart',
    components: [{
      type: 'CompositeYChart',
      config: {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 40,
        chartHeight: 350,
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'a',
              label: 'Label A',
              enabled: true,
              chart: 'StackedBarChart',
              color: colorScheme[1],
              axis: 'y',
            }, {
              accessor: 'b',
              label: 'Label B',
              enabled: true,
              chart: 'StackedBarChart',
              color: colorScheme[3],
              axis: 'y',
            }
          ]
        }
      }
    }]
  }, {
    id: 'grouped-chart2',
    type: 'XYChart',
    components: [{
      type: 'CompositeYChart',
      config: {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 40,
        chartHeight: 350,
        plot: {
          x: {
            accessor: 'x',
            axis: 'x'
          },
          y: [
            {
              accessor: 'c',
              label: 'Label C',
              enabled: true,
              chart: 'BarChart',
              color: colorScheme[4],
              axis: 'y',
            }
          ]
        }
      },
    }]
  }, {
    id: 'grouped-chart-navigation',
    type: 'XYChart',
    components: [{
      type: 'Navigation',
      config: {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 40,
        chartHeight: 250,
        selection: [75, 100],
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
            label: 'Time'
          },
          y: [
            {
              accessor: 'd',
              label: 'Label D',
              enabled: true,
              color: colorScheme[2],
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        },
        onChangeSelection: (dataProvider, chart) => {
          const chartToUpdate = ['grouped-chart1', 'grouped-chart2']
          if (_.includes(chartToUpdate, chart.el.id)) {
            chart.setData(dataProvider.data)
          }
        }
      }
    }]
  }
]

const chartView = new coCharts.charts.MultiChartView()
chartView.setConfig({
  chartId: 'grouped-parent-chart',
  // Parent Chart components
  components: [],
  // Child charts.
  charts: chartConfigs,
})
// selection on navigation will set the data on these charts.
// chartView.setData(complexData, {}, 'grouped-chart1')
// chartView.setData(complexData, {}, 'grouped-chart2')
chartView.setData(simpleData, {}, 'grouped-chart-navigation')
chartView.render()
