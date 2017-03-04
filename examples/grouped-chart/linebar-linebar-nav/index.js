/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {ChartView} from 'coCharts'
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

const chartConfig = {
  id: groupedChartsWrapper,
  components: [{
    id: container[0],
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
  }, {
    id: container[1],
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
  }, {
    id: container[2],
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

const chart = new ChartView()

export default {
  groupedChartsWrapper: groupedChartsWrapper,
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chart.setConfig(chartConfig)
    chart.setData(data, container[0])
  },
  remove: () => {
    chart.remove()
  }
}
