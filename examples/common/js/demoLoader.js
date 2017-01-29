/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')

const demoLBExamples = [
    {
        html: 'linebar-chart/cpu-mem/cpu-mem.html',
        js: 'linebar-chart/cpu-mem/cpu-mem.js',
        css: 'linebar-chart/cpu-mem/cpu-mem.css',
        title: 'Memory & CPU',
    }
]

const demoBubbleExamples = [
    {
        html: 'bubble-chart/port-distribution/port-distribution.html',
        js: 'bubble-chart/port-distribution/port-distribution.js',
        css: 'bubble-chart/port-distribution/port-distribution.css',
        title: "Ports' Traffic"
    }
]

const $lineBarLinks = $('#lineBarLinks')
demoLBExamples.forEach(
    (example, idx) => {
        let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
        $link.click(onClickLineChart)
        $lineBarLinks.append($('<li>').append($link))
    }
)

const $bubbleLinks = $('#bubbleLinks');
demoBubbleExamples.forEach(
    (example, idx) => {
        let $link = $(`<a href="#${idx}"><span class="nav-text">${example.title}</span></a>`)
        $link.click(onClickBubbleChart)
        $bubbleLinks.append($('<li>').append($link))
    }
)

function onClickLineChart(e) {
    const index = $(this).attr('href').split('#')[1]
    onClickSidebar(index, demoLBExamples)

}

function onClickBubbleChart(e) {
    const index = $(this).attr('href').split('#')[1]
    onClickSidebar(index, demoBubbleExamples)
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

function onClickSidebar(index, exampleArray) {
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