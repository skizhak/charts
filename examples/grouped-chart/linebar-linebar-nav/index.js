/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {charts} from 'coCharts'
import {_c} from 'commons'

const colorScheme = _c.lbColorScheme7
const data = []

let now = _.now()

for (let i = 0; i < 100; i++) {
  data.push({
    x: now - (i * 60000),
    a: _.random(10, 100),
    b: _.random(10, 100),
    c: _.random(400, 450),
    d: _.random(200, 300),
  })
}

const groupedChartsWrapper = 'grouped-parent-chart'
const container = ['grouped-chart1', 'grouped-chart2', 'grouped-chart-navigation']
const layoutMeta = {
  'grouped-chart1': 'render-order-1 col-md-6',
  'grouped-chart2': 'render-order-2 col-md-6',
  'grouped-chart-navigation': 'render-order-3 col-md-12',
}

const chartConfigs = [
  {
    id: container[0],
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
    id: container[1],
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
    id: container[2],
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
      }
    }]
  }
]

const chartConfig = {
  id: groupedChartsWrapper,
  // Parent Chart components
  components: [],
  // Child charts.
  charts: chartConfigs,
}

const chartView = new charts.MultiChartView()

export default {
  groupedChartsWrapper: groupedChartsWrapper,
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(data, container[0])
    chartView.setData(data, container[1])
    chartView.setData(data, container[2])
  },
  remove: () => {
    chartView.remove()
  }
}
