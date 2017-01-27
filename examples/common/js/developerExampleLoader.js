/* global $ */
/**
 * Update following to add a new example.
 * @type {*[]}
 */
require('../sass/contrail-charts-examples.scss')
const _ = require('lodash')
const examples = [
    {
        html: 'linebar-chart/legend/index.html',
        js: 'linebar-chart/legend/index.js',
        css: 'linebar-chart/legend/index.css',
        title: 'Line Grouped Bar Chart with Legend',
    }, {
        html: 'linebar-chart/control-panel/index.html',
        js: 'linebar-chart/control-panel/index.js',
        css: 'linebar-chart/control-panel/index.css',
        title: 'Line Stacked Bar Chart with Controls',
    },
    {
        html: 'linebar-chart/timeline/index.html',
        js: 'linebar-chart/timeline/index.js',
        css: 'linebar-chart/timeline/index.css',
        title: 'Line Chart with Timeline Navigation'
    },
    {
        html: 'linebar-chart/tooltip/index.html',
        js: 'linebar-chart/tooltip/index.js',
        css: 'linebar-chart/tooltip/index.css',
        title: 'Line Stacked Bar with Tooltips',
    },
    {
        html: 'linebar-chart/requirejs/requirejs.html',
        js: ['linebar-chart/requirejs/requirejs-config.js', 'linebar-chart/requirejs/app/example1.js'],
        css: 'linebar-chart/requirejs/app/example1.css',
        title: 'Line Stacked Bar Chart (RequireJS)',
    },
    {
        html: 'bubble-chart/multiple-shapes/index.html',
        js: 'bubble-chart/multiple-shapes/index.js',
        css: 'bubble-chart/multiple-shapes/index.css',
        title: 'Bubble Chart',
    },
    {
        html: 'grouped-chart/linebar-linebar-nav/index.html',
        js: 'grouped-chart/linebar-linebar-nav/index.js',
        css: 'grouped-chart/linebar-linebar-nav/index.css',
        title: 'Grouped Charts',
    },
    {
        html: 'area-chart/basic/index.html',
        js: 'area-chart/basic/index.js',
        css: 'area-chart/basic/index.css',
        title: 'Area Chart',
    },
    {
        html: 'radial-chart/pie/index.html',
        js: 'radial-chart/pie/index.js',
        css: 'radial-chart/pie/index.css',
        title: 'Pie Chart',
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
