/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/* global coCharts, describe, it, expect */
describe('coCharts', function () {
  it('coCharts is defined', function () {
    expect(coCharts).toBeDefined()
  })

  it('coCharts has ChartView, handlers and components', function () {
    expect(coCharts.ChartView).toBeDefined()
    expect(coCharts.handlers.SerieProvider).toBeDefined()
    expect(coCharts.handlers.DataFrameProvider).toBeDefined()
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

