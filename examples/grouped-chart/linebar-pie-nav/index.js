/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {charts} from 'coCharts'
import {formatter, _c} from 'commons'

const now = _.now()
const colorScheme = _c.d3ColorScheme20

const dataSrc = []
for (let i = 0; i < 100; i++) {
  dataSrc.push({
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

const groupedChartsWrapper = 'grouped-parent-chart'
const container = ['grouped-chart1', 'grouped-chart2', 'donut-chart', 'navigation-chart']
const layoutMeta = {
  'grouped-chart1': 'render-order-1 col-md-12',
  'grouped-chart2': 'render-order-2 col-md-8',
  'donut-chart': 'render-order-3 col-md-3',
  'navigation-chart': 'render-order-4 col-md-12'
}

const chartConfigs = [
  {
    id: container[0],
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
        possibleChartTypes: {
          y1: ['BarChart', 'LineChart'],
          y2: ['BarChart', 'LineChart']
        },
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
            ticks: 6
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
    }, {
      id: 'message-id',
      type: 'Message',
      config: {
        enabled: true,
      }
    }]
  }, {
    id: container[1],
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
    id: container[2],
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
        onClickNode: data => {
          chartView.actionman.fire('SendMessage', {
            action: 'once',
            messages: [{
              level: 'info',
              title: 'Pie chart message',
              message: `Sum of selected "${data.label}" values: ${data.value}`,
            }]
          })
        },
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
    id: container[3],
    type: 'XYChart',
    components: [{
      id: 'navigation-id',
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
        updateComponents: ['compositey-chart-id2'],
      }
    }]
  }
]

const chartConfig = {
  id: groupedChartsWrapper,
  type: 'MultiChart',
  components: [],
  // Child charts.
  charts: chartConfigs,
}

const chartView = new charts.MultiChartView()

export default {
  groupedChartsWrapper: groupedChartsWrapper,
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(dataSrc, container[0])
    chartView.setData(dataSrc, container[1])
    chartView.setData(dataSrc, container[3])

    // Update pie chart data on Navigation zoom
    const navDataProvider = chartView.getChart(container[3]).provider
    const zoom = chartView.actionman.get('Zoom')
    const pieChart = chartView.getChart(container[2])
    zoom.on('fired', (componentIds, {accessor, range}) => {
      const data = navDataProvider.filter(accessor, range)
      pieChart.setData(data)
    })
  },
  remove: () => {
    chartView.remove()
  }
}
