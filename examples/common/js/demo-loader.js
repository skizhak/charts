/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
/* global $ */

import '../sass/contrail-charts-examples.scss'
import _ from 'lodash'
import vrTraffic from '../../demo/area-chart/vr-traffic/vr-traffic.js'
import inoutTrafficChart from '../../demo/area-chart/inout-traffic/inout-traffic.js'
import nodeCPUMemChart from '../../demo/bubble-chart/nodes/nodes.js'
import portDistributionChart from '../../demo/bubble-chart/port-distribution/port-distribution.js'
import vRoutersChart from '../../demo/bubble-chart/vrouter-vmi/vrouter-vmi.js'
import queryDBChart from '../../demo/linebar-chart/query-db-rw/query-db.js'
import cpuMemChart from '../../demo/linebar-chart/cpu-mem/cpu-mem.js'
import vRouterTrafficChart from '../../demo/radial-chart/vr-vn-traffic/vr-vn-traffic.js'
import diskUsageChart from '../../demo/radial-chart/disk-usage/disk.js'
import poolUsageChart from '../../demo/radial-chart/pool-usage/pools.js'
import vnDetailChart from '../../demo/grouped-chart/vn-detail/vn-detail.js'
import computeNodeChart from '../../demo/grouped-chart/compute-node/cnode.js'

import groupedChartTemplate from '../template/multiple.tmpl'
import exampleDescTemplate from '../template/exampleDesc.tmpl'

const templates = {
  grouped: groupedChartTemplate
}

/**
 * structure of an example:
 * 'example title': {
 *   template: 'template id', <= optional
 *   instance: chartObject, <= required
 *   description: {
 *     chartTitle: 'detailed chart title',
 *     chartDesc: 'chart descripiton'
 *   } <= optional
 * }
 */
const allExamples = {
  'lineBar': {
    'Queries & DB R/W': {
      instance: queryDBChart,
      description: {
        chartTitle: 'QE Queries on Analytics Node',
        chartDesc: 'Real-time Line vs Stacked Bar chart is used to compare queries and r/w requests to cassandra.'
      }
    },
    'Memory & CPU': {
      instance: cpuMemChart,
      description: {
        chartTitle: 'vRouter CPU vs Memory',
        chartDesc: 'Line vs Grouped Bar chart is used to compare CPU and Memory of vRouters.'
      }
    }
  },
  'bubble': {
    'Node CPU/Mem': {
      instance: nodeCPUMemChart,
      description: {
        chartTitle: 'CPU & Memory of Contrail Nodes',
        chartDesc: `Bubble chart with navigation is used to analyze CPU and Memory of different nodes.
          Each node is identified by it's temporary icon. Users can filter the nodes by CPU Share through navigation chart at bottom.`
      }
    },
    'Port Distribution': {
      instance: portDistributionChart,
      description: {
        chartTitle: 'VN Traffic In/Out across Ports',
        chartDesc: `Top bubble charts displays the traffic in/out over a port range of a virtual network.
          Different, temporary icons are used to identify traffic in and traffic out.
          Users can filter the ports by traffic through navigation chart at bottom.`
      }
    },
    'vRouters': {
      instance: vRoutersChart,
      description: {
        chartTitle: 'VN, VMI, CPU, Memory of vRouters',
        chartDesc: `Top bubble charts displays virtual networks and interfaces of a vRouter.
          Users can filter the vRouters by CPU share through navigation chart at bottom.`
      }
    }
  },
  'grouped': {
    'Project VN Traffic': {
      template: 'grouped',
      instance: vnDetailChart,
      description: {
        chartTitle: 'Traffic Analysis for a Project',
        chartDesc: `A combination of three charts used to analyze traffic across VNs under a project.
          LineBar chart shows either total traffic of this project or traffic of VN selected by clicking on Pie chart.
          Bubble chart shows traffic across ports with two icons: one for in-traffic and other one for out-traffic.`
      }
    },
    'Compute Node': {
      template: 'grouped',
      instance: computeNodeChart,
      description: {
        chartTitle: 'Compute Node',
        chartDesc: `A combination of five charts used to analyze these stats of a vRouter node: System/Node CPU/Memory, Flows, Process CPU/Memory, Disk Usages.
          Area chart shows System/Node memory usage.
          Grouped Bar chart shows System/Node CPU usage.
          Stacked Bar chart with navigation show active, added, and deleted flows.
          Bubble chart shows CPU/Memory of different proceses on that node.
          Finally, pie chart shows the disk usage of node.`
      }
    }
  },
  'area': {
    'VN Traffic In/Out': {
      instance: inoutTrafficChart,
      description: {
        chartTitle: 'Traffic in/out of two VNs',
        chartDesc: `Real-time area chart is used to compare the in/out traffic of multiple VNs.
          Quadrant I displays traffic in and quadrant IV displays traffic out.`
      }
    },
    'vRouter Traffic': {
      instance: vrTraffic,
      description: {
        chartTitle: 'Traffic of two VRs',
        chartDesc: 'Area chart is used to compare the total traffic of multiple vRouters.'
      }
    }
  },
  'radial': {
    'vRouter Traffic': {
      instance: vRouterTrafficChart,
      description: {
        chartTitle: 'vRouter Traffic',
        chartDesc: 'A radial dendrogram used to show vRouter traffic between source and destination virtual-network, IP, port.'
      }
    },
    'OSD/Disk Status': {
      instance: diskUsageChart,
      description: {
        chartTitle: 'OSD status of Ceph cluster',
        chartDesc: 'Donut chart is used to show OSD states under a Ceph cluster.'
      }
    },
    'Storage Pools': {
      instance: poolUsageChart,
      description: {
        chartTitle: 'Pool allocation of Ceph cluster',
        chartDesc: 'Pie chart is used to show storage pool allocation under a Ceph cluster.'
      }
    }
  }
}

const $chartBox = $('#chartBox') // anchor point for mounting the chart
const $exampleDesc = $('#exampleDesc') // anchor point for mounting the example description

_.forEach(allExamples, (examples, chartCategory) => {
  let $links = $(`#${chartCategory}Links`)

  _.forEach(examples, (example, linkText) => {
    var $link = createLink(chartCategory, example.template, example.instance, linkText, example.description)

    $links.append($('<li>').append($link))
  })
})

function createLink (chartType = '', templateId = 'grouped', instance = {}, linkText = 'linkText', exampleDesc) {
  let cleaned = encodeURIComponent(linkText.replace(/\s/g, ''))
  let $link = $(`<a id="${chartType}${cleaned}" href="#${cleaned}"><span class="nav-text">${linkText}</span></a>`)

  $link.click((e) => {
    let containerIds = _.isArray(instance.container) ? instance.container : [instance.container]
    let currentInstance = $chartBox.data('currentInstance')

    if (currentInstance) {
      currentInstance.remove()
      if (currentInstance.stopUpdating) {
        currentInstance.stopUpdating()
      }
    }

    $exampleDesc.empty()
    $chartBox.empty()
    $chartBox.data('currentInstance', instance)

    if (!_.isNil(exampleDesc)) {
      $exampleDesc.append(exampleDescTemplate({
        chartTitle: exampleDesc.chartTitle,
        chartDesc: exampleDesc.chartDesc
      }))
    }

    $chartBox.append(templates[templateId]({
      groupedChartsWrapperId: instance.groupedChartsWrapper,
      containerIds: containerIds,
      layoutMeta: instance.layoutMeta
    }))

    instance.render()
  })

  return $link
}

const $1stNavMenu = $('.nav .nav-header + li').first()
$1stNavMenu.children('a').find('.nav-text').click()
$1stNavMenu.children('ul').find('a[id]').first().click()

$('#developer-link').click(function () {
  window.open('developer.html', '_self', false)
})
