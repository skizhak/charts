/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ */

import '../sass/contrail-charts-examples.scss'
import  _ from 'lodash'

import legend from '../../developer/linebar-chart/legend'
import controls from '../../developer/linebar-chart/control-panel'
import timeline from '../../developer/linebar-chart/timeline'
import tooltips from '../../developer/linebar-chart/tooltip'
import stackedBar from '../../developer/linebar-chart/stacked-bar-chart'
import groupedBar from '../../developer/linebar-chart/grouped-bar-chart'
import navigation from '../../developer/linebar-chart/navigation'
import liveData from '../../developer/linebar-chart/live'

import shapes from '../../developer/bubble-chart/multiple-shapes'

import pieChart from '../../developer/radial-chart/pie'
import dendrogramChart from '../../developer/radial-chart/dendrogram'
import areaBasic from '../../developer/area-chart/basic'
import twoBarNav from '../../developer/grouped-chart/linebar-linebar-nav/index.js'
import twoLineBarOnePieNav from '../../developer/grouped-chart/linebar-pie-nav/index.js'

import groupedChartTemplate from '../template/multiple.tmpl'

const templates = {
  grouped: groupedChartTemplate
}

/**
 * structure of an example:
 * 'example title': {
 *   template: 'template id', <= optional
 *   instance: chartObject <= required
 * }
 */
const allExamples = {
  'lineBar': {
    'Legend': {
      instance: legend
    },
    'Controls': {
      instance: controls
    },
    'Timeline': {
      instance: timeline
    },
    'Tooltips': {
      instance: tooltips
    },
    'Stacked Bar': {
      instance: stackedBar
    },
    'Grouped Bar': {
      instance: groupedBar
    },
    'Navigation': {
      instance: navigation
    },
    // TODO fix requireJS example loading. locally loading using file:// is blocked in browser (cross-origin). Should work in hosted example scenario
    // 'RequireJS': {
    //   instance: function RJS (callback) {
    //     if (!window.AMDChartInstance) {
    //       window.AMDChartInstance = {}
    //
    //       // NOTE: this delay wrapper is unnecessary if the jquery custom event is working
    //       // Something breaks jQuery.trigger function
    //       var _callback = function () {
    //         setTimeout(function () {
    //           callback()
    //         }, 500)
    //       }
    //     }
    //
    //     let entryPoint = document.createElement('script')
    //
    //     entryPoint.setAttribute('data-main', './developer/linebar-chart/requirejs/requirejs-config.js')
    //     entryPoint.src = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js'
    //
    //     entryPoint.onreadystatechange = function () {
    //       if (this.readyState === 'complete') {
    //         if (_callback) {
    //           _callback()
    //         } else {
    //           callback()
    //         }
    //       }
    //     }
    //     entryPoint.onload = _callback || callback
    //
    //     document.body.append(entryPoint)
    //   }
    // },
    'Live Data': {
      instance: liveData
    }
  },
  'bubble': {
    'Shapes': {
      instance: shapes
    }
  },
  'radial': {
    'Pie Chart': {
      instance: pieChart
    },
    'Dendrogram': {
      instance: dendrogramChart
    }
  },
  'area': {
    'Basic': {
      instance: areaBasic
    }
  },
  'grouped': {
    '2 Bar Nav': {
      template: 'grouped',
      instance: twoBarNav
    },
    '2 LineBar 1 Pie Nav': {
      template: 'grouped',
      instance: twoLineBarOnePieNav
    }
  }
}

const $chartBox = $('#chartBox')

_.forEach(allExamples, (examples, chartCategory) => {
  let $links = $(`#${chartCategory}Links`)

  _.forEach(examples, (example, title) => {
    var $link = createLink(chartCategory, example.template, example.instance, title)

    $links.append($('<li>').append($link))
  })
})

function _RJSRender (templateId, chartType, linkText) {
  const RJSInstance = window.AMDChartInstance[`${chartType}${linkText}`]
  let containerIds = _.isArray(RJSInstance.container) ? RJSInstance.container : [RJSInstance.container]
  let currentInstance = $chartBox.data('currentInstance')

  if (currentInstance) {
    currentInstance.remove()
    if (currentInstance.stopUpdating) {
      currentInstance.stopUpdating()
    }
  }

  $chartBox.empty()
  $chartBox.data('currentInstance', RJSInstance)
  $chartBox.append(templates[templateId]({
    groupedChartsWrapperId: RJSInstance.groupedChartsWrapper,
    containerIds: containerIds,
    layoutMeta: RJSInstance.layoutMeta
  }))

  RJSInstance.render()
}

const RJSInitFlag = 'RJSInstantiated'

function createLink (chartType = '', templateId = 'grouped', instance, linkText) {
  let cleaned = encodeURIComponent(linkText.replace(/\s/g, ''))
  let $link = $(`<a id="${chartType}${cleaned}" href="#${cleaned}"><span class="nav-text">${linkText}</span></a>`)

  if (_.isFunction(instance) && instance.name === 'RJS') {
    $link.click((e) => {
      if (instance === RJSInitFlag) {
        _RJSRender(templateId, chartType, cleaned)
      } else if (_.isFunction(instance) && instance.name === 'RJS') {
        instance(() => {
          instance = RJSInitFlag
          _RJSRender(templateId, chartType, cleaned)
        })
      }
    })
  } else if (_.isObject(instance)) {
    $link.click((e) => {
      let containerIds = _.isArray(instance.container) ? instance.container : [instance.container]
      let currentInstance = $chartBox.data('currentInstance')

      if (currentInstance) {
        currentInstance.remove()
        if (currentInstance.stopUpdating) {
          currentInstance.stopUpdating()
        }
      }

      $chartBox.empty()
      $chartBox.data('currentInstance', instance)
      $chartBox.append(templates[templateId]({
        groupedChartsWrapperId: instance.groupedChartsWrapper,
        containerIds: containerIds,
        layoutMeta: instance.layoutMeta
      }))

      instance.render()
    })
  }

  return $link
}

const $1stNavMenu = $('.nav .nav-header + li').first()
$1stNavMenu.children('a').find('.nav-text').click()
$1stNavMenu.children('ul').find('a[id]').first().click()

$('#demo-link').click(function () {
  window.open('demo.html', '_self', false)
})
