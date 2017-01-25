/* global coCharts, describe, it, expect, beforeEach */
describe('RadialChartView', () => {
  beforeEach(() => {
    this.chartConfig = {
      container: '#chart',
      components: [{
        id: 'pieChart',
        type: 'pieChart',
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

  it('RadialChartView has pie component', () => {
    this.chartView.setConfig(this.chartConfig)
    expect(this.chartView.getComponent('pieChart')).toBeDefined()
  })
})
