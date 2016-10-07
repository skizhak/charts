
define([
	"d3",
    "contrail-charts"
], function( d3, coCharts ) {

	// Complex example
	var complexData = [];
	_.each( d3.range( 100 ), function( i ) {
		var a = Math.random() * 100;
		complexData.push( {
			x: 1475760930000 + 1000000 * i,
			a: a,
			b: a + Math.random() * 10,
			c: Math.random() * 100,
			d: i + (Math.random() - 0.5) * 10,
			e: (Math.random() - 0.5) * 10
		});
	});
	var complexChartView = new coCharts.ChartView();
	complexChartView.setData( complexData );
	complexChartView.setConfig( {
		mainChart: {
			el: "#complexChart-mainChart",
			marginInner: 10,
			marginLeft: 80,
			marginRight: 80,
			marginBottom: 40,
			xAccessor: 'x',
			accessorData: {
				a: {
					enable: true,
					chartType: 'stackedBar',
					y: 1,
					label: "A Label",
					tooltip: {
						nameFormatter: function( key ) {
							return "A";
						},
						valueFormatter: d3.format( ".05f" )
					}
				},
				b: {
					enable: true,
					chartType: 'stackedBar',
					y: 1,
					label: "B Label",
					tooltip: {
						nameFormatter: function( key ) {
							return "B";
						},
						valueFormatter: d3.format( ".0f" )
					}
				},
				c: {
					enable: false,
					chartType: 'stackedBar',
					y: 1,
					label: "C Label"
				},
				d: {
					enable: true,
					chartType: 'line',
					y: 2,
					label: "Megabytes",
					color: "#d62728"
				},
				e: {
					enable: true,
					chartType: 'line',
					y: 2,
					label: "Megabytes",
					color: "#9467bd"
				}
			},
			axis: {
				x: {
					
				},
				y1: {
					formatter: d3.format( ".01f" ),
					labelMargin: 15
				},
				y2: {
					formatter: d3.format( ".0f" ),
					labelMargin: 15
				}
			}
		},
		navigation: {
			el: "#complexChart-navigation",
			marginInner: 10,
			marginLeft: 80,
			marginRight: 80,
			marginBottom: 40,
			xAccessor: 'x',
			accessorData: {
				a: {
					enable: true,
					chartType: 'stackedBar',
					y: 1,
					label: "A Label"
				},
				b: {
					enable: true,
					chartType: 'stackedBar',
					y: 1,
					label: "B Label"
				}				
			}
		},
		tooltip: {

		}
	});
	complexChartView.render();



	// Most basic chart.
	var simpleData = [
		{ x: 1475760930000, y: 0 },
		{ x: 1475761930000, y: 3 },
		{ x: 1475762930000, y: 2 },
		{ x: 1475763930000, y: 4 },
		{ x: 1475764930000, y: 5 }
	];
	var simpleChartView = new coCharts.ChartView();
	simpleChartView.setData( simpleData );
	simpleChartView.setConfig( {
		mainChart: {
			el: "#simpleChart",
			xAccessor: 'x',
			accessorData: {
				y: {
					chartType: 'line'
				}
			}
		}
	});
	simpleChartView.render();


});
