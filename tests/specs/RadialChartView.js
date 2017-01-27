/* global coCharts, describe, it, expect, beforeEach */
describe('RadialChartView', function () {
  beforeEach(function () {
    this.chartConfig = {
      container: '#chart',
      components: [{
        id: 'pieChart',
        type: 'PieChart',
        config: {
          type: 'donut',
          radius: 100,
          serie: {
            getValue: (v) => v.y,
            getLabel: (v) => v.x,
            valueFormatter: (v) => v,
          }
        },
      }]
    }
    this.data = [
      { x: 'System process', y: 4499890 },
      { x: 'Process 1', y: 2704659 },
      { x: 'Process 2', y: 2159981 },
      { x: 'Process 3', y: 3853788 },
    ]
    this.chartView = new coCharts.charts.RadialChartView()
  })

  it('RadialChartView has pie component', function () {
    this.chartView.setConfig(this.chartConfig)
    expect(this.chartView.getComponent('pieChart')).toBeDefined()
  })
})
