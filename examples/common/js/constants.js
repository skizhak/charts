/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global d3 */

const d3ColorScheme10 = d3.schemeCategory10
const d3ColorScheme20 = d3.schemeCategory20

const bubbleColorScheme6 = [
  '#3f51b5',
  d3ColorScheme10[1],
  d3ColorScheme10[0],
  '#2e7d32',
  '#424242',
  '#9c27b0'
]

const lbColorScheme7 = [
  '#a88add',
  '#fcc100',
  '#2196f3',
  '#4caf50',
  '#0cc2aa',
  '#6cc788',
  '#6887ff'
]

const radialColorScheme6 = [
  '#00bcd4',
  '#4caf50',
  '#a88add',
  '#fcc100',
  '#2196f3',
  '#c62828'
]

const bubbleShapes = {
  signin: '&#xf090;',
  signout: '&#xf08b;',
  certificate: '&#xf0a3;',
  circleFill: '&#xf111;',
  dotCircle: '&#xf192;',
  cog: '&#xf013;',
  dashboard: '&#xf0e4;',
  db: '&#xf1c0;',
  desktop: '&#xf108;'
}

module.exports = {
  bubbleShapes: bubbleShapes,
  bubbleColorScheme6: bubbleColorScheme6,
  lbColorScheme7: lbColorScheme7,
  radialColorScheme6: radialColorScheme6,
  d3ColorScheme10: d3ColorScheme10,
  d3ColorScheme20: d3ColorScheme20
}
