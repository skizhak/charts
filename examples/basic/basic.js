/* global coCharts */

// Time series data.
const tsData = [
  { ts: 1475760930000, mem: 0, cpu: 10 },
  { ts: 1475761930000, mem: 3, cpu: 20 },
  { ts: 1475762930000, mem: 2, cpu: 15 },
  { ts: 1475763930000, mem: 4, cpu: 30 },
  { ts: 1475764930000, mem: 5, cpu: 40 }
]

// Create chart view.
const cpuMemChartView = new coCharts.charts.XYChartView()
cpuMemChartView.setConfig({
  container: '#basicChart',
  components: [{
    type: 'CompositeYChartView',
    config: {
      plot: {
        x: {
          accessor: 'ts',
          label: 'Time',
          //axis: 'x'
        },
        y: [
          {
            accessor: 'mem',
            label: 'Memory',
            enabled: true,
            chart: 'line',
            color: 'green',
            axis: 'y1'
          },
          {
            accessor: 'cpu',
            label: 'CPU',
            enabled: true,
            chart: 'bar',
            color: 'steelblue',
            axis: 'y2'
          }
        ]
      },
      axis: {
        y1: {
          label: 'Memory',
          position: 'left'
        },
        y2: {
          label: 'CPU',
          position: 'right'
        }
      }
    }
  }]
})

cpuMemChartView.setData(tsData)
