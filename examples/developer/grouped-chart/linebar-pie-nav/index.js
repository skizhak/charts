/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const _ = require('lodash')
const formatter = require('formatter')

const tsData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  tsData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 10
  })
}

function pieDataParser (tsData) {
  const tsSumData = _.reduce(tsData, (v1, v2) => {
    return {
      a: v1.a + v2.a,
      b: v1.b + v2.b,
      c: v1.c + v2.c,
    }
  })
  return _.map(tsSumData, (v, k) => {
    return {
      label: k,
      value: v
    }
  })
}

const chartConfigs = [
  {
    id: 'grouped-chart1',
    type: 'XYChart',
    container: '#grouped-chart1',
    components: [{
      type: 'LegendPanel',
      config: {
        sourceComponent: 'compositey-chart-id',
        editable: {
          colorSelector: true,
          chartSelector: true
        },
        placement: 'horizontal',
        filter: true,
      },
    }, {
      id: 'compositey-chart-id',
      type: 'CompositeYChart',
      config: {
        chartHeight: 300,
        xTicks: 6,
        possibleChartTypes: ['BarChart', 'LineChart'],
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'a',
              enabled: true,
              chart: 'BarChart',
              axis: 'y',
            }, {
              accessor: 'b',
              enabled: true,
              chart: 'BarChart',
              axis: 'y',
            }
          ]
        }
      }
    }]
  }, {
    id: 'grouped-chart2',
    type: 'XYChart',
    container: '#grouped-chart2',
    components: [{
      type: 'LegendPanel',
      config: {
        sourceComponent: 'compositey-chart-id2',
        editable: {
          colorSelector: true,
          chartSelector: false
        },
        placement: 'horizontal',
        filter: true,
      },
    }, {
      type: 'CompositeYChart',
      id: 'compositey-chart-id2',
      config: {
        chartHeight: 300,
        possibleChartTypes: ['BarChart', 'LineChart'],
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'c',
              enabled: true,
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        }
      },
    }]
  }, {
    id: 'grouped-chart3',
    type: 'RadialChart',
    container: '#donut-chart',
    dataProvider: {
      config: {
        formatData: pieDataParser
      }
    },
    components: [{
      id: 'donut-chart-id',
      type: 'PieChart',
      config: {
        type: 'donut',
        radius: 100,
        chartWidth: 200,
        chartHeight: 300,
        colorScale: d3.scaleOrdinal().range(d3.schemeCategory20), // eslint-disable-line no-undef
        serie: {
          getValue: serie => serie.value,
          getLabel: serie => serie.label,
          valueFormatter: formatter.commaGroupedInteger,
        },
        tooltip: 'tooltip-id',
      },
    }, {
      id: 'tooltip-id',
      type: 'Tooltip',
      config: {
        dataConfig: [
          {
            accessor: 'value',
            labelFormatter: serie => serie.label,
            valueFormatter: formatter.commaGroupedInteger,
          },
        ],
      },
    }, {
      type: 'LegendUniversal',
      config: {
        sourceComponent: 'donut-chart-id',
      },
    }]
  }, {
    id: 'navigation-chart',
    container: '#navigation-chart',
    type: 'XYChart',
    components: [{
      type: 'Navigation',
      config: {
        chartHeight: 300,
        selection: [0, 30],
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              accessor: 'c',
              enabled: true,
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        }
      }
    }]
  }
]

const chartView = new coCharts.charts.MultiChartView()
chartView.setConfig({
  id: 'grouped-parent-chart',
  type: 'MultiChart',
  container: '#grouped-parent-chart',
  components: [],
  // Child charts.
  charts: chartConfigs,
})

// chartView.setData(tsData, {}, 'grouped-chart1')
// chartView.setData(tsData, {}, 'grouped-chart2')
chartView.setData(tsData, {}, 'navigation-chart')
chartView.setData(tsData, {}, 'grouped-chart3')
chartView.render()
