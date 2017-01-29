/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
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
    css: 'linebar-chart/control-panel/index.css',
    title: 'Controls',
  },
  {
    html: 'linebar-chart/timeline/index.html',
    js: 'linebar-chart/timeline/index.js',
    css: 'linebar-chart/timeline/index.css',
    title: 'Timeline'
  },
  {
    html: 'linebar-chart/tooltip/index.html',
    js: 'linebar-chart/tooltip/index.js',
    css: 'linebar-chart/tooltip/index.css',
    title: 'Tooltips',
  },
  {
    html: 'linebar-chart/requirejs/requirejs.html',
    js: ['linebar-chart/requirejs/requirejs-config.js', 'linebar-chart/requirejs/app/example1.js'],
    css: 'linebar-chart/requirejs/app/example1.css',
    title: 'RequireJS',
  }
]

const devBubbleExamples = [
  {
    html: 'bubble-chart/multiple-shapes/index.html',
    js: 'bubble-chart/multiple-shapes/index.js',
    css: 'bubble-chart/multiple-shapes/index.css',
    title: 'Shapes',
  }
]

const devRadialExamples = [
  {
    html: 'radial-chart/pie/index.html',
    js: 'radial-chart/pie/index.js',
    css: 'radial-chart/pie/index.css',
    title: 'Example',
  }
]

const devAreaExamples = [
  {
    html: 'area-chart/basic/index.html',
    js: 'area-chart/basic/index.js',
    css: 'area-chart/basic/index.css',
    title: 'Example',
  }
]

const devAdvanceExamples = [
  {
    html: 'grouped-chart/linebar-linebar-nav/index.html',
    js: 'grouped-chart/linebar-linebar-nav/index.js',
    css: 'grouped-chart/linebar-linebar-nav/index.css',
    title: 'Grouped',
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

const $advanceLinks = $('#advanceLinks')
devAdvanceExamples.forEach(
    (example, idx) => {
      let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
      $link.click(onClickAdvanceChart)
      $advanceLinks.append($('<li>').append($link))
    }
)

$('#linebar').click()
$lineBarLinks.find('#lb0').click()

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
