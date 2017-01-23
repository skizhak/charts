/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/* global coCharts, describe, it, expect */
describe('coCharts', () => {
  it('coCharts is defined', () => {
    expect(coCharts).toBeDefined()
  })

  it('coCharts has all charts, handlers and components', () => {
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

