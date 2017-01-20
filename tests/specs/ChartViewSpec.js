/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/* global coCharts, describe, it, expect, spyOn */
describe('coCharts', function () {
  it('coCharts is defined', function () {
    expect(coCharts).toBeDefined()
  })

  it('coCharts has all charts, handlers and components', function () {
    expect(coCharts.charts.MultiChartView).toBeDefined()
    expect(coCharts.charts.XYChartView).toBeDefined()
    expect(coCharts.handlers.DataProvider).toBeDefined()
    expect(coCharts.components.compositeY.ConfigModel).toBeDefined()
    expect(coCharts.components.compositeY.View).toBeDefined()
    expect(coCharts.components.controlPanel.ConfigModel).toBeDefined()
    expect(coCharts.components.controlPanel.View).toBeDefined()
    expect(coCharts.components.message.ConfigModel).toBeDefined()
    expect(coCharts.components.message.View).toBeDefined()
    expect(coCharts.components.navigation.ConfigModel).toBeDefined()
    expect(coCharts.components.navigation.View).toBeDefined()
    expect(coCharts.components.tooltip.ConfigModel).toBeDefined()
    expect(coCharts.components.tooltip.View).toBeDefined()
  })
})

describe('coCharts.charts.XYChartView', function () {
  beforeEach(function () {
    this.simpleChartConfig = {
      container: '#chartView',
      components: [{
        id: 'compositeY',
        type: 'compositeY',
        config: {
          plot: {
            x: {
              accessor: 'x',
              axis: 'x',
            },
            y: [{
              enabled: true,
              accessor: 'y',
              chart: 'line',
              axis: 'y',
            }]
          },
        }
      }]
    }
    this.chartView = new coCharts.charts.XYChartView()
  })

  it('XYChartView has xyChart component', function () {
    this.chartView.setConfig(this.simpleChartConfig)
    expect(this.chartView.getComponent('compositeY')).toBeDefined()
    expect(this.chartView.getComponent('navigation')).not.toBeDefined()
  })

  it('XYChartView xy component generates activeAccessorData on render', function (done) {
    this.chartView.setData([])
    this.chartView.setConfig(this.simpleChartConfig)
    const compositeY = this.chartView.getComponent('compositeY')
    compositeY.render()
    // Time for component init before assert
    setTimeout(function () {
      expect(compositeY.params.activeAccessorData[0]).toBeDefined()
      done()
    }, 10)
  })

  it('On XYChartView render, component xy render is called', function () {
    this.chartView.setConfig(this.simpleChartConfig)
    const compositeY = this.chartView.getComponent('compositeY')
    spyOn(compositeY, 'render')
    this.chartView.render()
    expect(compositeY.render).toHaveBeenCalled()
  })

  it('On XYChartView data set, component xy render is called', function () {
    this.chartView.setConfig(this.simpleChartConfig)
    const compositeY = this.chartView.getComponent('compositeY')
    spyOn(compositeY, 'render')
    this.chartView.setData([
      { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
      { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
      { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
      { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
      { x: (new Date(2016, 11, 5)).getTime(), y: 5 },
    ])
    expect(compositeY.render).toHaveBeenCalled()
  })
})
