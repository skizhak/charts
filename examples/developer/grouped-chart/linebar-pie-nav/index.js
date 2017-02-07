/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const commons = require('commons')

const _ = commons._
const formatter = commons.formatter
const _c = commons._c

const now = _.now()
const colorScheme = _c.d3ColorScheme20

const simpleData = []
for (let i = 0; i < 100; i++) {
  simpleData.push({
    x: now - (i * 300000),
    a: _.random(10, 200),
    b: _.random(10, 300),
    c: _.random(10, 900),
    d: _.random(100, 150),
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
    components: [{
      type: 'LegendPanel',
      config: {
        marginLeft: 90,
        marginRight: 60,
        marginBottom: 40,
        chartHeight: 350,
        sourceComponent: 'compositey-chart-id',
        editable: {
          colorSelector: false,
          chartSelector: false
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
              color: colorScheme[0],
              axis: 'y',
            }, {
              accessor: 'b',
              enabled: true,
              chart: 'BarChart',
              color: colorScheme[1],
              axis: 'y',
            }
          ]
        }
      }
    }]
  }, {
    id: 'grouped-chart2',
    type: 'XYChart',
    components: [{
      type: 'LegendPanel',
      config: {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 40,
        chartHeight: 350,
        sourceComponent: 'compositey-chart-id2',
        editable: {
          colorSelector: false,
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
              color: colorScheme[2],
            }
          ]
        }
      },
    }]
  }, {
    id: 'donut-chart',
    type: 'RadialChart',
    dataProvider: {
      config: {
        formatter: pieDataParser
      }
    },
    components: [{
      id: 'donut-chart-id',
      type: 'PieChart',
      config: {
        marginLeft: 60,
        type: 'donut',
        radius: 100,
        chartWidth: 200,
        chartHeight: 300,
        colorScale: d3.scaleOrdinal().range([colorScheme[0], colorScheme[4], colorScheme[2]]), // eslint-disable-line no-undef
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
    type: 'XYChart',
    components: [{
      type: 'Navigation',
      config: {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 40,
        chartHeight: 350,
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
              chart: 'LineChart',
              color: colorScheme[4],
              axis: 'y',
            }
          ]
        },
        onChangeSelection: (dataProvider, chart) => {
          const chartToUpdate = ['grouped-chart1', 'grouped-chart2', 'donut-chart']
          if (_.includes(chartToUpdate, chart.el.id)) {
            chart.setData(dataProvider.data)
          }
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
chartView.setData(simpleData, {}, 'navigation-chart')
chartView.setData(simpleData, {}, 'grouped-chart3')
chartView.render()
