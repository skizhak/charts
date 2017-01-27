/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')
const examples = [
    {
        html: 'linebar-chart/multi-linebar-nav/index.html',
        js: 'linebar-chart/multi-linebar-nav/index.js',
        css: 'linebar-chart/multi-linebar-nav/index.css',
        title: 'LineBar Chart with Legend',
    }, {
        html: 'other/control-panel/index.html',
        js: 'other/control-panel/index.js',
        css: 'other/control-panel/index.css',
        title: 'Line Chart with Control Panel (Embedded Components)',
    },
    {
        html: 'other/tooltip/index.html',
        js: 'other/tooltip/index.js',
        css: 'other/tooltip/index.css',
        title: 'Line, Stacked Bar, and Line Charts (Tooltip & Custom Tooltip)',
    },
    {
        html: 'scatterplot/scatter-nav/index.html',
        js: 'scatterplot/scatter-nav/index.js',
        css: 'scatterplot/scatter-nav/index.css',
        title: 'Scatter Chart',
    },
    {
        html: 'multi-chart/linebar-linebar-nav/index.html',
        js: 'multi-chart/linebar-linebar-nav/index.js',
        css: 'multi-chart/linebar-linebar-nav/index.css',
        title: 'Grouped Charts',
    },
    {
        html: 'area-chart/basic/index.html',
        js: 'area-chart/basic/index.js',
        css: 'area-chart/basic/index.css',
        title: 'Area Chart',
    },
    {
        html: 'pie-chart/donut/index.html',
        js: 'pie-chart/donut/index.js',
        css: 'pie-chart/donut/index.css',
        title: 'Pie Chart',
    },
    {
        html: 'timeline-chart/linebar-timeline/index.html',
        js: 'timeline-chart/linebar-timeline/index.js',
        css: 'timeline-chart/linebar-timeline/index.css',
        title: 'Chart with Timeline as Navigation'
    },
    {
        html: 'other/requirejs/requirejs.html',
        js: ['other/requirejs/requirejs-config.js', 'other/requirejs/app/example1.js'],
        css: 'other/requirejs/app/example1.css',
        title: 'Charts using RequireJS',
    }
]

const loadedExampleSrc = []
const $exampleLinks = $('#exampleLinks')

examples.forEach(
    (example, idx) => {
        loadedExampleSrc.push({
            rawHTML: require('raw!../../developer/' + example.html),
            rawCSS: require('raw!../../developer/' + example.css),
            rawJS: Array.isArray(example.js) ? example.js.reduce((loadedFiles, currentFile) => {
                    loadedFiles[currentFile] = require('raw!../../developer/' + currentFile)
                    return loadedFiles
                }, {}) : {[example.js]: require('raw!../../developer/' + example.js)}
        })
        let $link = $(`<a href="#${idx}" class="link">${example.title}</a>`)
        $link.click(sideBarLinkOnClick)
        $exampleLinks.append($('<li>').append($link))
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
    const example = examples[index]
    const {rawHTML, rawJS, rawCSS} = loadedExampleSrc[index]

    $('#outputView').find('.output-demo-iframe').attr('src', `./developer/${example.html}`)
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
