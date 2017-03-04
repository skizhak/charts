/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {ChartView} from 'coCharts'
import {formatter, _c} from 'commons'

const now = _.now()
const colorScheme = _c.d3ColorScheme20

const data = []
for (let i = 0; i < 100; i++) {
  data.push({
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

const chartConfig = {
  id: 'chart-id',
  title: 'Static bar chart for series: a, b',
  components: [{
    id: 'legend-panel-id',
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
  }, {
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
  }, {
    id: 'donut-chart-id',
    type: 'PieChart',
    provider: {
      formatter: pieDataParser,
    },
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
        chart.renderMessage({
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
    container: 'donut-chart-id',
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
  }, {
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

const chart = new ChartView()

export default {
  groupedChartsWrapper: groupedChartsWrapper,
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chart.setConfig(chartConfig)
    chart.setData(data)

    // Update pie chart data on Navigation zoom
    const navigation = chart.getComponent('navigation-id')
    const zoom = navigation.actionman.get('Zoom')
    const pieChart = chart.getComponent('pie-chart-id')
    zoom.on('fired', (componentIds, {accessor, range}) => {
      const data = navigation.model.filter(accessor, range)
      pieChart.model.data = data
    })
  },
  remove: () => {
    chart.remove()
  }
}
