/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')

const lineBarExamples = [
    {
        html: 'linebar-chart/cpu-mem/cpu-mem.html',
        js: 'linebar-chart/cpu-mem/cpu-mem.js',
        css: 'linebar-chart/cpu-mem/cpu-mem.css',
        title: 'CPU & Memory',
    }
]

const bubbleExamples = [
    {
        html: 'bubble-chart/port-distribution/port-distribution.html',
        js: 'bubble-chart/port-distribution/port-distribution.js',
        css: 'bubble-chart/port-distribution/port-distribution.css',
        title: "Ports' Traffic"
    }
]

const loadedExampleSrc = []
const $lineBarLinks = $('#lineBarLinks')

lineBarExamples.forEach(
    (example, idx) => {
        loadedExampleSrc.push({
            rawHTML: require('raw!../../demo/' + example.html),
            rawCSS: require('raw!../../demo/' + example.css),
            rawJS: Array.isArray(example.js) ? example.js.reduce((loadedFiles, currentFile) => {
                    loadedFiles[currentFile] = require('raw!../../demo/' + currentFile)
                    return loadedFiles
                }, {}) : {[example.js]: require('raw!../../demo/' + example.js)}
        })
        let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
        $link.click(sideBarLinkOnClick)
        $lineBarLinks.append($('<li>').append($link))
    }
)

function reformatHTMLToShow(rawHTML) {
    const newlineMarker = '%%%newline%%%'
    const regex = {
        recoverNewline: new RegExp(newlineMarker, 'gm'),
        indentation: new RegExp(`(?:${newlineMarker})(\\s{2,})`, 'gm')
    }

    return _.escape(rawHTML.replace(/\n/gm, newlineMarker))
        .replace(regex.indentation, (match) => match.replace(/\s/gm, '&nbsp;'))
        .replace(regex.recoverNewline, '<br/>')
}

function createNewTab(id, title, group = 'js-files', checked, content) {
    return `<div class="tab">
            <input type="radio" id="${id}" name="${group}" ${checked} />
            <label for="${id}">${title}</label>
            <div class="content">
              ${content}
            </div>
          </div>`
}

function sideBarLinkOnClick(e) {
    const index = $(this).attr('href').split('#')[1]
    console.log(index);
    const example = lineBarExamples[index]
    const {rawHTML, rawJS, rawCSS} = loadedExampleSrc[index]

    $('#outputView').find('.output-demo-iframe').attr('src', `./demo/${example.html}`)
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
