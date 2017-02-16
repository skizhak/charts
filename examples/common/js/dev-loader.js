/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ */

require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')

const legend = require('../../developer/linebar-chart/legend')
const controls = require('../../developer/linebar-chart/control-panel')
const timeline = require('../../developer/linebar-chart/timeline')
const tooltips = require('../../developer/linebar-chart/tooltip')
const stackedBar = require('../../developer/linebar-chart/stacked-bar-chart')
const groupedBar = require('../../developer/linebar-chart/grouped-bar-chart')
const navigation = require('../../developer/linebar-chart/navigation')
const liveData = require('../../developer/linebar-chart/live')

const shapes = require('../../developer/bubble-chart/multiple-shapes')

const pieChart = require('../../developer/radial-chart/pie')
const dendrogramChart = require('../../developer/radial-chart/dendrogram')
const areaBasic = require('../../developer/area-chart/basic')
const twoBarNav = require('../../developer/grouped-chart/linebar-linebar-nav/index.js')
const twoLineBarOnePieNav = require('../../developer/grouped-chart/linebar-pie-nav/index.js')

const groupedChartTemplate = require('../template/multiple.tmpl')

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
    'RequireJS': {
      instance: function RJS (callback) {
        if (!window.AMDChartInstance) {
          window.AMDChartInstance = {}
        }

        let entryPoint = document.createElement('script')

        entryPoint.setAttribute('data-main', './developer/linebar-chart/requirejs/requirejs-config.js')
        entryPoint.src = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js'

        entryPoint.onreadystatechange = function () {
          if (this.readyState === 'complete') {
            callback()
          }
        }
        entryPoint.onload = callback

        document.body.append(entryPoint)
      }
    },
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

function createLink (chartType = '', templateId = 'grouped', instance, title) {
  let cleaned = encodeURIComponent(title.replace(/\s/g, ''))
  let $link = $(`<a id="${chartType}${cleaned}" href="#${cleaned}"><span class="nav-text">${title}</span></a>`)

  if (_.isFunction(instance) && instance.name === 'RJS') {
    instance(() => {
      $link.click((e) => {
        const RJSInstance = window.AMDChartInstance[`${chartType}${cleaned}`]

        if (e.currentTarget.id !== 'lineBarLiveData') {
          allExamples.lineBar['Live Data'].instance.stopUpdating()
        }

        let containerIds = _.isArray(RJSInstance.container) ? RJSInstance.container : [RJSInstance.container]

        $chartBox.empty()
        $chartBox.append(templates[templateId]({
          groupedChartsWrapperId: RJSInstance.groupedChartsWrapper,
          containerIds: containerIds,
          layoutMeta: RJSInstance.layoutMeta
        }))

        RJSInstance.render()
      })

      instance = 'RJSInstantiated'
    })
  } else if (_.isObject(instance)) {
    $link.click((e) => {
      if (e.currentTarget.id !== 'lineBarLiveData') {
        allExamples.lineBar['Live Data'].instance.stopUpdating()
      }

      let containerIds = _.isArray(instance.container) ? instance.container : [instance.container]

      $chartBox.empty()
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

const $1stNavMenu = $('.nav .nav-header + li')
$1stNavMenu.children('a').find('.nav-text').click()
$1stNavMenu.children('ul').find('a[id]').first().click()

$('#demo-link').click(function () {
  window.open('demo.html', '_self', false)
})
