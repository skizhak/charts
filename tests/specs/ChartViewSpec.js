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
    expect(coCharts.components.CompositeYChartConfigModel).toBeDefined()
    expect(coCharts.components.CompositeYChartView).toBeDefined()
    expect(coCharts.components.ControlPanelConfigModel).toBeDefined()
    expect(coCharts.components.ControlPanelView).toBeDefined()
    expect(coCharts.components.MessageConfigModel).toBeDefined()
    expect(coCharts.components.MessageView).toBeDefined()
    expect(coCharts.components.NavigationConfigModel).toBeDefined()
    expect(coCharts.components.NavigationView).toBeDefined()
    expect(coCharts.components.TooltipConfigModel).toBeDefined()
    expect(coCharts.components.TooltipView).toBeDefined()
  })
})

