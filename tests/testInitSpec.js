// var Browser = require('zombie')
//
// describe('test app', function () {
//   function onContrailChartsLoad (callback) {
//     var options = {
//       debug: false,
//       runScripts: true,
//       maxWait: 100,
//       waitFor: 100000
//     }
//     var browser = new Browser(options)
//     var url = 'file:///Users/sarink/github/absingla/contrail-charts/tests/TestRunner.html'
//     it('It should load contrail-charts client', function () {
//       browser.visit(url)
//       browser.wait(function (window) {
//         console.log("wait...", window.coCharts)
//       }, function(e, browser) {
//         console.log('wait complete', e, browser)
//         callback(window)
//       })
//     })
//   }
//   onContrailChartsLoad(function (window) {
//     console.log(window.coCharts)
//     require('./specs/ChartViewSpec')
//   })
// })

var page = require('webpage').create()
page.open('file:///Users/sarink/github/absingla/contrail-charts/tests/TestRunner.html', function(status) {
  console.log(status);
  phantom.exit()
})