/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ */

require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')

const inoutTrafficChart = require('../../demo/area-chart/inout-traffic/inout-traffic.js')
const vrTraffic = require('../../demo/area-chart/vr-traffic/vr-traffic.js')
const nodeCPUMemChart = require('../../demo/bubble-chart/nodes/nodes.js')
const portDistributionChart = require('../../demo/bubble-chart/port-distribution/port-distribution.js')
const vRoutersChart = require('../../demo/bubble-chart/vrouter-vmi/vrouter-vmi.js')
const queryDBChart = require('../../demo/linebar-chart/query-db-rw/query-db.js')
const cpuMemChart = require('../../demo/linebar-chart/cpu-mem/cpu-mem.js')
const diskUsageChart = require('../../demo/radial-chart/disk-usage/disk.js')
const poolUsageChart = require('../../demo/radial-chart/pool-usage/pools.js')
const vnDetailChart = require('../../demo/grouped-chart/vn-detail/vn-detail.js')

const groupedChartTemplate = require('../template/multiple.tmpl')

const templates = {
  grouped: groupedChartTemplate
}

const allExamples = {
  'lineBar': {
    'Queries & DB R/W': {
      instance: queryDBChart
    },
    'Memory & CPU': {
      instance: cpuMemChart
    }
  },
  'bubble': {
    'Node CPU/Mem': {
      instance: nodeCPUMemChart
    },
    'Port Distribution': {
      instance: portDistributionChart
    },
    'vRouters': {
      instance: vRoutersChart
    }
  },
  'grouped': {
    'Project VN Traffic': {
      template: 'grouped',
      instance: vnDetailChart
    }
  },
  'area': {
    'VN Traffic In/Out': {
      instance: inoutTrafficChart
    },
    'vRouter Traffic': {
      instance: vrTraffic
    }
  },
  'radial': {
    'Disk Status': {
      instance: diskUsageChart
    },
    'Storage Pools': {
      instance: poolUsageChart
    }
  }
}

const devGroupedExamples = [
  {
    html: 'grouped-chart/vn-detail/vn-detail.html',
    js: 'grouped-chart/vn-detail/vn-detail.js',
    css: 'grouped-chart/vn-detail/vn-detail.css',
    title: 'Project VN Traffic',
  }
]

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

  $link.click((e) => {
    if (e.currentTarget.id !== 'lbQueries&DBR/W') {
      allExamples.lineBar['Queries & DB R/W'].instance.stopUpdating()
    }

    let containerIds = _.isArray(instance.container) ? instance.container : [instance.container]

    $chartBox.empty()
    $chartBox.append(templates[templateId]({
      chartContainerIds: containerIds
    }))
// debugger
    instance.render()
  })

  return $link
}

const $1stNavMenu = $('.nav .nav-header + li')
$1stNavMenu.children('a').find('.nav-text').click()
$1stNavMenu.children('ul').find('a[id]').first().click()

$('#developer-link').click(function () {
  window.open('developer.html')
})
