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
import liveData from '../../linebar-chart/live'
// Scatter
import shapes from '../../bubble-chart/multiple-shapes'
// Radial
import pieChart from '../../radial-chart/pie'
import dendrogramChart from '../../radial-chart/dendrogram'
import areaBasic from '../../area-chart/basic'
import navigation from '../../grouped-chart/navigation/index.js'
import twoLineBarOnePieNav from '../../grouped-chart/linebar-pie-nav/index.js'
import sankeyChart from '../../sankey-chart'
/**
 * structure of an example:
 * 'example title': {
 *   template: 'template id', <= optional
 *   view: instance of chart view <= required
 *   description: demonstrated features
 * }
 */
const allExamples = {
  'lineBar': {
    'Legend': {
      view: legend,
    },
    'Controls': {
      view: controls,
    },
    'Timeline': {
      view: timeline,
    },
    'Tooltips': {
      view: tooltips,
    },
    'Stacked Bar': {
      view: stackedBar,
    },
    'Grouped Bar': {
      view: groupedBar,
    },
    'RequireJS': {
      view: {
        type: 'RJS',
        entryPoint: './examples/linebar-chart/requirejs/requirejs-config.js'
      }
    },
    'Live Data': {
      view: liveData,
    }
  },
  'bubble': {
    'Shapes': {
      view: shapes,
    }
  },
  'radial': {
    'Pie Chart': {
      view: pieChart,
    },
    'Dendrogram': {
      view: dendrogramChart,
    }
  },
  'area': {
    'Basic': {
      view: areaBasic,
    }
  },
  'grouped': {
    'Navigation': {
      view: navigation,
      desc: `Grouped chart with Navigation component for all of them. </br>
      First line chart is not updated as it is plotted with different values at x axis`,
    },
    '2 LineBar 1 Pie Nav': {
      view: twoLineBarOnePieNav
    }
  },
  'sankey': {
    'Sankey': {
      view: sankeyChart
    }
  }
}

const $content = $('.content')
const $chartBox = $('#chartBox')

_.forEach(allExamples, (examples, chartCategory) => {
  let $links = $(`#${chartCategory}Links`)
  _.forEach(examples, (example, title) => {
    example.title = title
    example.category = chartCategory
    var $link = createLink(example)
    $links.append($('<li>').append($link))
  })
})

function _viewRenderInit ({view, title = '', desc = ''}) {
  let currentView = $chartBox.data('chartView')
  if (currentView) {
    currentView.remove()
    if (currentView.stopUpdating) currentView.stopUpdating()
  }

  // Cleanup and apply containers template
  $content.find('#page-title').text(title)
  $content.find('#page-description').html(desc)
  $chartBox.empty()
  // set current view
  $chartBox.data('chartView', view)
  view.render()
}

function createLink (example) {
  const chartType = example.category || ''
  const view = example.view
  const cleaned = encodeURIComponent(example.title.replace(/\s/g, ''))
  const link = `<a id="${chartType}${cleaned}" href="#${chartType}${cleaned}">
    <span class="nav-text">${example.title}</span>
    </a>`
  const $link = $(link)
  if (view.type === 'RJS') {
    $link.click(e => _initRJS(example))
  } else {
    $link.click(e => _viewRenderInit(example))
  }
  return $link
}

function _initRJS (example) {
  const RJSInitFlag = 'RJSInstantiated'
  const view = example.view
  if (view.status && view.status === RJSInitFlag) {
    _viewRenderInit(example)
  } else {
    // Load the entry point
    let entryPoint = document.createElement('script')
    entryPoint.src = 'node_modules/requirejs/require.js'
    entryPoint.setAttribute('data-main', view.entryPoint)
    document.body.append(entryPoint)
    // Once the require entry point load is complete (not just the file load but all dependencies),
    // the script callback will invoke render callback.
    window.AMDRenderCB = (RJSChartView) => {
      example.view = _.extend({status: RJSInitFlag}, view, RJSChartView)
      _viewRenderInit(example)
    }
  }
}
const exampleId = window.location.hash || '#groupedNavigation'
$(exampleId).click()
