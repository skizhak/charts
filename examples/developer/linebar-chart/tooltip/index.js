/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {charts} from 'coCharts'
import {formatter, fixture} from 'commons'

const data = fixture()

const container = ['chart-tooltip-1', 'chart-tooltip-2']
const layoutMeta = {
  'chart-tooltip-1': 'col-md-11',
  'chart-tooltip-2': 'col-md-11'
}

const chartConfig1 = {
  id: container[0],
  components: [{
    id: 'compositey-id-1',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 't',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'custom-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Megabytes C',
            color: 'grey',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          ticks: 5,
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
          ticks: 5,
        },
      },
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }, {
    id: 'custom-tooltip',
    type: 'Tooltip',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }]
}

const chartConfig2 = {
  id: container[1],
  components: [{
    id: 'compositey-id-2',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 't',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'sticky-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          ticks: 5,
        },
      },
    },
  }, {
    id: 'sticky-tooltip',
    type: 'Tooltip',
    config: {
      sourceComponent: 'compositey-id-2',
      sticky: true,
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }]
}

const chart1 = new charts.XYChartView()
const chart2 = new charts.XYChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chart1.setConfig(chartConfig1)
    chart1.setData(data)
    chart2.setConfig(chartConfig2)
    chart2.setData(data)
  },
  remove: () => {
    chart1.remove()
    chart2.remove()
  }
}
