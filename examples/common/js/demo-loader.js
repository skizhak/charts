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
  },
  {
    html: 'linebar-chart/cpu-mem/cpu-mem.html',
    js: 'linebar-chart/cpu-mem/cpu-mem.js',
    title: 'Memory & CPU'
  }
]

const demoBubbleExamples = [
  {
    html: 'bubble-chart/nodes/nodes.html',
    js: 'bubble-chart/nodes/nodes.js',
    title: "Node CPU/Mem"
  },
  {
    html: 'bubble-chart/port-distribution/port-distribution.html',
    js: 'bubble-chart/port-distribution/port-distribution.js',
    title: "Port Distribution"
  },
  {
    html: 'bubble-chart/vrouter-vmi/vrouter-vmi.html',
    js: 'bubble-chart/vrouter-vmi/vrouter-vmi.js',
    title: "vRouters"
  }
]

const areaExamples = [
  {
    html: 'area-chart/inout-traffic/inout-traffic.html',
    js: 'area-chart/inout-traffic/inout-traffic.js',
    title: 'VN Traffic In/Out'
  },
  {
    html: 'area-chart/vr-traffic/vr-traffic.html',
    js: 'area-chart/vr-traffic/vr-traffic.js',
    title: 'vRouter Traffic'
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

const devAdvanceExamples = [
  {
    html: 'grouped-chart/vn-detail/vn-detail.html',
    js: 'grouped-chart/vn-detail/vn-detail.js',
    css: 'grouped-chart/vn-detail/vn-detail.css',
    title: 'Virtual Network Details',
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
    let $link = $(`<a id="b${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickAreaChart)
    $areaLinks.append($('<li>').append($link))
  }
)

const $radialLinks = $('#radialLinks')
radialExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="b${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickRadialChart)
    $radialLinks.append($('<li>').append($link))
  }
)

const $advanceLinks = $('#advanceLinks')
devAdvanceExamples.forEach(
  (example, idx) => {
    let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickAdvanceChart)
    $advanceLinks.append($('<li>').append($link))
  }
)

$('#bubble').click()
$bubbleLinks.find('#b0').click()

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

function onClickAdvanceChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, devAdvanceExamples)
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
