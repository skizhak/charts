/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global $ */

require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')

const devLBExamples = [
  {
    html: 'linebar-chart/legend/index.html',
    js: 'linebar-chart/legend/index.js',
    css: 'linebar-chart/legend/index.css',
    title: 'Legend',
  }, {
    html: 'linebar-chart/control-panel/index.html',
    js: 'linebar-chart/control-panel/index.js',
    title: 'Controls',
  },
  {
    html: 'linebar-chart/timeline/index.html',
    js: 'linebar-chart/timeline/index.js',
    title: 'Timeline'
  },
  {
    html: 'linebar-chart/tooltip/index.html',
    js: 'linebar-chart/tooltip/index.js',
    title: 'Tooltips',
  },
  {
    html: 'linebar-chart/grouped-bar-chart/index.html',
    js: 'linebar-chart/grouped-bar-chart/index.js',
    title: 'Grouped Bar',
  },
  {
    html: 'linebar-chart/navigation/index.html',
    js: 'linebar-chart/navigation/index.js',
    title: 'Navigation',
  },
  {
    html: 'linebar-chart/requirejs/requirejs.html',
    js: ['linebar-chart/requirejs/requirejs-config.js', 'linebar-chart/requirejs/app/example.js'],
    title: 'RequireJS',
  },
  {
    html: 'linebar-chart/live/index.html',
    js: 'linebar-chart/live/index.js',
    title: 'Live Data',
  }
]

const devBubbleExamples = [
  {
    html: 'bubble-chart/multiple-shapes/index.html',
    js: 'bubble-chart/multiple-shapes/index.js',
    title: 'Shapes',
  }
]

const devRadialExamples = [
  {
    html: 'radial-chart/pie/index.html',
    js: 'radial-chart/pie/index.js',
    css: 'radial-chart/pie/index.css',
    title: 'Pie Chart',
  },
  {
    html: 'radial-chart/dendrogram/index.html',
    js: 'radial-chart/dendrogram/index.js',
    css: 'radial-chart/dendrogram/index.css',
    title: 'Dendrogram',
  }
]

const devAreaExamples = [
  {
    html: 'area-chart/basic/index.html',
    js: 'area-chart/basic/index.js',
    title: 'Example',
  }
]

const devGroupedExamples = [
  {
    html: 'grouped-chart/linebar-linebar-nav/index.html',
    js: 'grouped-chart/linebar-linebar-nav/index.js',
    css: 'grouped-chart/linebar-linebar-nav/index.css',
    title: '2 Bar Nav',
  },
  {
    html: 'grouped-chart/linebar-pie-nav/index.html',
    js: 'grouped-chart/linebar-pe-nav/index.js',
    css: 'grouped-chart/linebar-pie-nav/index.css',
    title: '2 LineBar 1 Pie Nav',
  }
]

const $lineBarLinks = $('#lineBarLinks')
devLBExamples.forEach(
  (example, idx) => {
    let $link = $(`<a id="lb${idx}" href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickLBChart)
    $lineBarLinks.append($('<li>').append($link))
  }
)

const $bubbleLinks = $('#bubbleLinks')
devBubbleExamples.forEach(
  (example, idx) => {
    let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickBubbleChart)
    $bubbleLinks.append($('<li>').append($link))
  }
)

const $areaLinks = $('#areaLinks')
devAreaExamples.forEach(
  (example, idx) => {
    let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
    $link.click(onClickAreaChart)
    $areaLinks.append($('<li>').append($link))
  }
)

const $radialLinks = $('#radialLinks')
devRadialExamples.forEach(
  (example, idx) => {
    let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
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

$('#demo-link').click(function () {
  window.open('demo.html', '_self', false)
})

function onClickLBChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, devLBExamples)
}

function onClickBubbleChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, devBubbleExamples)
}

function onClickAreaChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, devAreaExamples)
}

function onClickRadialChart (e) {
  const index = $(this).attr('href').split('#')[1]
  onClickSidebar(index, devRadialExamples)
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
  $('#outputView').find('.output-demo-iframe').attr('src', `./developer/${example.html}`)

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
