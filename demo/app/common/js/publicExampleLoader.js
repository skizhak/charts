/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')
const examples = [
  {
    html: 'composite-xy/composite-xy.html',
    js: 'composite-xy/composite-xy.js',
    css: 'composite-xy/composite-xy.css',
    title: 'Line Bar chart with Legend panel',
  }, {
    html: 'control-panel/index.html',
    js: 'control-panel/index.js',
    css: 'control-panel/index.css',
    title: 'Line chart with Control Panel with embedded components',
  }, {
    html: 'multi-chart/multi-chart.html',
    js: 'multi-chart/multi-chart.js',
    css: 'multi-chart/multi-chart.css',
    title: 'Multi Chart with Focus',
  }, {
    html: 'scatterplot/scatterplot.html',
    js: 'scatterplot/scatterplot.js',
    css: 'scatterplot/scatterplot.css',
    title: 'Scatter Plot',
  }, {
    html: 'area/area.html',
    js: 'area/area.js',
    css: 'area/area.css',
    title: 'Area Chart',
  }, {
    html: 'pie/pie.html',
    js: 'pie/pie.js',
    css: 'pie/pie.css',
    title: 'Pie Chart',
  }, {
    html: 'requirejs/requirejs.html',
    js: ['requirejs/requirejs-config.js', 'requirejs/app/example1.js'],
    css: 'requirejs/app/example1.css',
    title: 'Using RequireJS',
  }, {
    html: 'composite-xy-timeline/composite-xy-timeline.html',
    js: 'composite-xy-timeline/composite-xy-timeline.js',
    css: 'composite-xy-timeline/composite-xy-timeline.css',
    title: 'Simple Timeline navigation'
  }
]

const loadedExampleSrc = []
const $exampleLinks = $('#exampleLinks')

examples.forEach(
  (example, idx) => {
    loadedExampleSrc.push({
      rawHTML: require('raw!../../../examples/' + example.html),
      rawCSS: require('raw!../../../examples/' + example.css),
      rawJS: Array.isArray(example.js) ? example.js.reduce((loadedFiles, currentFile) => {
        loadedFiles[currentFile] = require('raw!../../../examples/' + currentFile)
        return loadedFiles
      }, {}) : {[example.js]: require('raw!../../../examples/' + example.js)}
    })
    let $link = $(`<a href="#${idx}" class="link">${example.title}</a>`)
    $link.click(sideBarLinkOnClick)
    $exampleLinks.append($('<li>').append($link))
  }
)

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

function createNewTab (id, title, group = 'js-files', checked, content) {
  return `<div class="tab">
            <input type="radio" id="${id}" name="${group}" ${checked} />
            <label for="${id}">${title}</label>
            <div class="content">
              ${content}
            </div>
          </div>`
}

function sideBarLinkOnClick (e) {
  const index = $(this).attr('href').split('#')[1]
  const example = examples[index]
  const {rawHTML, rawJS, rawCSS} = loadedExampleSrc[index]

  $('#outputView').find('.output-demo-iframe').attr('src', `../examples/${example.html}`)
  $('#htmlContent').html(reformatHTMLToShow(rawHTML))
  $('#cssContent').html(reformatHTMLToShow(rawCSS))

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

  $('#jsContent').html(`<div class="tabs">${tabCollections}</div>`)
}
