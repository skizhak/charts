/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
/* global $ */

import '../sass/contrail-charts-examples.scss'
import _ from 'lodash'
// LineBar
import legend from '../../linebar-chart/legend'
import controls from '../../linebar-chart/control-panel'
import timeline from '../../linebar-chart/timeline'
import tooltips from '../../linebar-chart/tooltip'
import stackedBar from '../../linebar-chart/stacked-bar-chart'
import groupedBar from '../../linebar-chart/grouped-bar-chart'
import navigation from '../../linebar-chart/navigation'
import liveData from '../../linebar-chart/live'
// Scatter
import shapes from '../../bubble-chart/multiple-shapes'
// Radial
import pieChart from '../../radial-chart/pie'
import dendrogramChart from '../../radial-chart/dendrogram'
import areaBasic from '../../area-chart/basic'
import twoBarNav from '../../grouped-chart/linebar-linebar-nav/index.js'
import twoLineBarOnePieNav from '../../grouped-chart/linebar-pie-nav/index.js'

import groupedChartTemplate from '../template/multiple.tmpl'

const templates = {
  grouped: groupedChartTemplate
}

/**
 * structure of an example:
 * 'example title': {
 *   template: 'template id', <= optional
 *   view: instance of chart view <= required
 * }
 */
const allExamples = {
  'lineBar': {
    'Legend': {
      view: legend
    },
    'Controls': {
      view: controls
    },
    'Timeline': {
      view: timeline
    },
    'Tooltips': {
      view: tooltips
    },
    'Stacked Bar': {
      view: stackedBar
    },
    'Grouped Bar': {
      view: groupedBar
    },
    'Navigation': {
      view: navigation
    },
    'RequireJS': {
      view: {
        type: 'RJS',
        entryPoint: './examples/linebar-chart/requirejs/requirejs-config.js'
      }
    },
    'Live Data': {
      view: liveData
    }
  },
  'bubble': {
    'Shapes': {
      view: shapes
    }
  },
  'radial': {
    'Pie Chart': {
      view: pieChart
    },
    'Dendrogram': {
      view: dendrogramChart
    }
  },
  'area': {
    'Basic': {
      view: areaBasic
    }
  },
  'grouped': {
    '2 Bar Nav': {
      template: 'grouped',
      view: twoBarNav
    },
    '2 LineBar 1 Pie Nav': {
      template: 'grouped',
      view: twoLineBarOnePieNav
    }
  }
}

const $chartBox = $('#chartBox')

_.forEach(allExamples, (examples, chartCategory) => {
  let $links = $(`#${chartCategory}Links`)
  _.forEach(examples, (example, title) => {
    var $link = createLink(chartCategory, example.template, example.view, title)
    $links.append($('<li>').append($link))
  })
})

function _viewRenderInit (templateId, view) {
  let containerIds = _.isArray(view.container) ? view.container : [view.container]
  let currentView = $chartBox.data('chartView')
  if (currentView) {
    currentView.remove()
    if (currentView.stopUpdating) {
      currentView.stopUpdating()
    }
  }
  // Cleanup and apply template.
  $chartBox.empty()
  $chartBox.data('chartView', view)
  $chartBox.append(templates[templateId]({
    groupedChartsWrapperId: view.groupedChartsWrapper,
    containerIds: containerIds,
    layoutMeta: view.layoutMeta
  }))
  // Render it
  view.render()
}

function createLink (chartType = '', templateId = 'grouped', view, linkText) {
  const RJSInitFlag = 'RJSInstantiated'
  let cleaned = encodeURIComponent(linkText.replace(/\s/g, ''))
  let $link = $(`<a id="${chartType}${cleaned}" href="#${chartType}${cleaned}"><span class="nav-text">${linkText}</span></a>`)
  if (view.type === 'RJS') {
    $link.click((e) => {
      if (view.status && view.status === RJSInitFlag) {
        _viewRenderInit(templateId, view.AMDChartView)
      } else {
        // Load the entry point
        let entryPoint = document.createElement('script')
        entryPoint.src = 'node_modules/requirejs/require.js'
        entryPoint.setAttribute('data-main', view.entryPoint)
        document.body.append(entryPoint)
        // Once the require entry point load is complete (not just the file load but all dependencies),
        // the script callback will invoke render callback.
        window.AMDRenderCB = (RJSChartView) => {
          view.AMDChartView = RJSChartView
          view.status = RJSInitFlag
          _viewRenderInit(templateId, RJSChartView)
        }
      }
    })
  } else {
    $link.click((e) => {
      _viewRenderInit(templateId, view)
    })
  }
  return $link
}
const exampleId = window.location.hash || '#grouped2BarNav'
$(exampleId).click()
