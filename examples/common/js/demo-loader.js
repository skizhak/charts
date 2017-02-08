/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ */

require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')

const demoLBExamples = [
  {
    html: 'linebar-chart/query-db-rw/query-db.html',
    js: 'linebar-chart/query-db-rw/query-db.js',
    title: 'Queries & DB R/W',
    chartTitle: 'QE Queries on Analytics Node',
    chartDesc: 'Real-time Line vs Stacked Bar chart is used to compare queries and r/w requests to cassandra.'
  },
  {
    html: 'linebar-chart/cpu-mem/cpu-mem.html',
    js: 'linebar-chart/cpu-mem/cpu-mem.js',
    title: 'Memory & CPU',
    chartTitle: 'vRouter CPU vs Memory',
    chartDesc: 'Line vs Grouped Bar chart is used to compare CPU and Memory of vRouters.'
  }
]

const demoBubbleExamples = [
  {
    html: 'bubble-chart/nodes/nodes.html',
    js: 'bubble-chart/nodes/nodes.js',
    title: 'Node CPU/Mem',
    chartTitle: 'CPU & Memory of Contrail Nodes',
    chartDesc: 'Bubble chart with navigation is used to analyze CPU and Memory of different nodes. Each node is identified by it\'s temporary icon. Users can filter the nodes by CPU Share through navigation chart at bottom.'
  },
  {
    html: 'bubble-chart/port-distribution/port-distribution.html',
    js: 'bubble-chart/port-distribution/port-distribution.js',
    title: 'Port Distribution',
    chartTitle: 'VN Traffic In/Out across Ports',
    chartDesc: 'Top bubble charts displays the traffic in/out over a port range of a virtual network. Different, temporary icons are used to identify traffic in and traffic out. Users can filter the ports by traffic through navigation chart at bottom.'
  },
  {
    html: 'bubble-chart/vrouter-vmi/vrouter-vmi.html',
    js: 'bubble-chart/vrouter-vmi/vrouter-vmi.js',
    title: 'vRouters',
    chartTitle: 'VN, VMI, CPU, Memory of vRouters',
    chartDesc: 'Top bubble charts displays virtual networks and interfaces of a vRouter. Users can filter the vRouters by CPU share through navigation chart at bottom.'
  }
]

const areaExamples = [
  {
    html: 'area-chart/inout-traffic/inout-traffic.html',
    js: 'area-chart/inout-traffic/inout-traffic.js',
    title: 'VN Traffic In/Out',
    chartTitle: 'Traffic In/Out of two VNs',
    chartDesc: 'Area chart is used to compare the in/out traffic of multiple VNs. Quadrant I displays traffic in and quadrant IV displays traffic out.'
  },
  {
    html: 'area-chart/vr-traffic/vr-traffic.html',
    js: 'area-chart/vr-traffic/vr-traffic.js',
    title: 'vRouter Traffic',
    chartTitle: 'Traffic of two VRs',
    chartDesc: 'Area chart is used to compare the total traffic of multiple vRouters.'
  }
]

const radialExamples = [
  {
    html: 'radial-chart/disk-usage/disk.html',
    js: 'radial-chart/disk-usage/disk.js',
    css: 'radial-chart/disk-usage/disk.css',
    title: 'Disk Status'
  },
  {
    html: 'radial-chart/pool-usage/pools.html',
    js: 'radial-chart/pool-usage/pools.js',
    css: 'radial-chart/pool-usage/pools.css',
    title: 'Storage Pools'
  }
]

const devGroupedExamples = [
  {
    html: 'grouped-chart/vn-detail/vn-detail.html',
    js: 'grouped-chart/vn-detail/vn-detail.js',
    css: 'grouped-chart/vn-detail/vn-detail.css',
    title: 'Project VN Traffic',
    chartTitle: 'Traffic Analysis for a Project',
    chartDesc: 'A combination of three charts used to analyze traffic across VNs under a project. LineBar chart shows either total traffic of this project or traffic of VN selected by clicking on Pie chart. Bubble chart shows traffic across ports with two icons: one for in-traffic and other one for out-traffic.'
  }
]

const $lineBarLinks = $('#lineBarLinks')
demoLBExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="lb${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickLineChart)
    $lineBarLinks.append($('<li>').append($link))
  }
)

const $bubbleLinks = $('#bubbleLinks')
demoBubbleExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="b${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickBubbleChart)
    $bubbleLinks.append($('<li>').append($link))
  }
)

const $areaLinks = $('#areaLinks')
areaExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="a${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickAreaChart)
    $areaLinks.append($('<li>').append($link))
  }
)

const $radialLinks = $('#radialLinks')
radialExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="r${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickRadialChart)
    $radialLinks.append($('<li>').append($link))
  }
)

const $groupedLinks = $('#groupedLinks')
devGroupedExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="g${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickGroupedChart)
    $groupedLinks.append($('<li>').append($link))
  }
)

$('#grouped').click()
$groupedLinks.find('#g0').click()

$('#developer-link').click(function () {
  window.open('developer.html')
})

function onClickLineChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, demoLBExamples)
}

function onClickBubbleChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, demoBubbleExamples)
}

function onClickAreaChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, areaExamples)
}

function onClickRadialChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, radialExamples)
}

function onClickGroupedChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, devGroupedExamples)
}

function createNewTab (id, title, group = 'js-files', checked, content) {
  return `<div class="tab">
            <input type="radio" id="${id}" name="${group}" ${checked} />
            <label for="${id}">${title}</label>
            <div class="content">
              ${content}
            </div>
          </div>`
}

function reformatHTMLToShow (rawHTML) {
  const newlineMarker = '%%%newline%%%'
  const regex = {
    recoverNewline: new RegExp(newlineMarker, 'gm'),
    indentation: new RegExp(`(?:${newlineMarker})(\\s{2,})`, 'gm')
  }

  return _.escape(rawHTML.replace(/\n/gm, newlineMarker))
    .replace(regex.indentation, (match) => match.replace(/\s/gm, '&nbsp;'))
    .replace(regex.recoverNewline, '<br/>')
}

function onClickSidebar (index, exampleArray) {
  const example = exampleArray[index]
  const {rawHTML, rawJS, rawCSS} = exampleArray[index]
  $('#outputView').find('.output-demo-iframe').attr('src', `./demo/${example.html}`)

  const chartTitle = exampleArray[index].chartTitle
  const chartDesc = exampleArray[index].chartDesc

  $('#chartTitle').text(chartTitle ? chartTitle : '')
  $('#chartDesc').text(chartDesc ? chartDesc : '')

  /*
   const tabCollections = Object.keys(rawJS)
   .reduce((tabsHTML, currentJSFile, idx) => {
   tabsHTML.push(
   createNewTab(
   'jsFile-' + idx,
   currentJSFile,
   undefined,
   idx === 0 ? 'checked' : '',
   reformatHTMLToShow(rawJS[currentJSFile])
   )
   )
   return tabsHTML
   }, []).join('')

   $('#htmlContent').html(reformatHTMLToShow(rawHTML))
   $('#cssContent').html(reformatHTMLToShow(rawCSS))
   $('#jsContent').html(`<div class="tabs">${tabCollections}</div>`)
   */
}
