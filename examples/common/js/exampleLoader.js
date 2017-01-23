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
    html: 'requirejs/requirejs.html',
    js: 'requirejs/app/example1.js',
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
    title: 'Simple Timeline navigation',
  }
]

const $exampleLinks = $('#exampleLinks')
for (let i = 0; i < examples.length; i++) {
  const $link = $('<a href="#' + i + '" class="link">' + examples[i].title + '</a>')
  $link.click(sideBarLinkOnClick)
  $exampleLinks.append($('<li>').append($link))
}

function sideBarLinkOnClick (e) {
  const index = $(this).attr('href').split('#')[1]
  const example = examples[index]
  $('#outputView').find('.output-demo-iframe').attr('src', example.html)
  // Todo: Fix html code display
  // $('#htmlContent').find('.source-html-iframe')
  $('#jsContent').find('.source-js-iframe').attr('src', example.js)
  $('#cssContent').find('.source-css-iframe').attr('src', example.css)
}
