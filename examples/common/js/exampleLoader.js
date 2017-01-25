/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
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
    html: 'tooltip/index.html',
    js: 'tooltip/index.js',
    css: 'tooltip/index.css',
    title: 'Line, Stacked Bar and Line charts with tooltip and custom tooltip',
  }, {
    html: 'requirejs/requirejs.html',
    js: ['requirejs/requirejs-config.js', 'requirejs/app/example1.js'],
    css: 'requirejs/app/example1.css',
    title: 'Using RequireJS',
  }, {
    html: 'linebar/linebar.html',
    js: 'linebar/linebar.js',
    css: 'linebar/linebar.css',
    title: 'Line Bar chart (CPU/Mem)',
  }, {
    html: 'composite-xy-timeline/composite-xy-timeline.html',
    js: 'composite-xy-timeline/composite-xy-timeline.js',
    css: 'composite-xy-timeline/composite-xy-timeline.css',
    title: 'Simple Timeline navigation'
  },
  {
    html: 'port-distribution/port-distribution.html',
    js: 'port-distribution/port-distribution.js',
    css: 'port-distribution/port-distribution.css',
    title: 'Port Distribution'
  }
]

let loadedExampleSrc = []
let $exampleLinks = $('#exampleLinks')

examples.forEach(
  (example, idx) => {
    loadedExampleSrc.push({
      rawHTML: require('raw!../../' + example.html),
      rawCSS: require('raw!../../' + example.css),
      rawJS: Array.isArray(example.js) ? example.js.reduce((loadedFiles, currentFile) => {
        loadedFiles[currentFile] = require('raw!../../' + currentFile)
        return loadedFiles
      }, {}) : {[example.js]: require('raw!../../' + example.js)}
    })
    let $link = $(`<a href="#${idx}" class="link">${example.title}</a>`)
    $link.click(sideBarLinkOnClick)
    $exampleLinks.append($('<li>').append($link))
  }
)

function htmlEntityEncoding (srcString) {
  if (!srcString) {
    return srcString
  }

  let encoder = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;'
  }

  let retStr = srcString.replace(/./g, (letter) => {
    let encoded = encoder[letter]

    return encoded || letter
  })

  return retStr
}

function reformatHTMLToShow (rawHTML) {
  let newlineMarker = '%%%newline%%%'
  let regex = {
    recoverNewline: new RegExp(newlineMarker, 'gm'),
    indentation: new RegExp(`(?:${newlineMarker})(\\s{2,})`, 'gm')
  }

  return htmlEntityEncoding(rawHTML.replace(/\n/gm, newlineMarker))
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
  let index = $(this).attr('href').split('#')[1]
  let example = examples[index]
  let {rawHTML, rawJS, rawCSS} = loadedExampleSrc[index]

  $('#outputView').find('.output-demo-iframe').attr('src', example.html)
  $('#htmlContent').html(reformatHTMLToShow(rawHTML))
  $('#cssContent').html(reformatHTMLToShow(rawCSS))

  let tabCollections = Object.keys(rawJS)
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
