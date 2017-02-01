/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const colorScheme = d3.schemeCategory20

const simpleData = [
  { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
  { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
  { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
  { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
  { x: (new Date(2016, 11, 5)).getTime(), y: 5 },
]

const simpleChartView = new coCharts.charts.XYChartView()
simpleChartView.setConfig({
  container: '#basic-area-chart',
  components: [{
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
            accessor: 'y',
            chart: 'AreaChart',
            axis: 'y',
            color: colorScheme[1]
          }
        ]
      },
      axis: {
        x: {
          domain: [(new Date(2016, 11, 2)).getTime(), (new Date(2016, 11, 4)).getTime()]
        },
        y: {
          domain: [0, 10],
          ticks: 10,
        }
      }
    }
  }]
})
simpleChartView.setData(simpleData)
