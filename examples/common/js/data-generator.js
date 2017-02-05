/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

//Data generator for examples

const _ = require('lodash')
const d3 = require('d3')

function projectVNTraffic(p = {}) {
  const data = []
  const dataConfig = p || {}

  const vnCount = dataConfig['vnCount'] || 3
  const flowCount = dataConfig['flowCount'] || 50
  const now = _.now()

  let vnName = ''
  let vn = {}

  for(let j = 0; j < vnCount; j++) {
    vnName = 'virtual-network' + j
    vn = {
      vnName: vnName,
      vmiCount: _.random(2, 20),
      flows: generateFlows4VN(flowCount, now)
    }
    data.push(vn)
  }

  return data
}

function generateFlows4VN(flowCount, now) {
  let flows = []
  let flow = {}

  let inTraffic = 0
  let outTraffic = 0

  for(let j = 0; j < flowCount; j++) {
    inTraffic = _.random(768000, 1024000)
    outTraffic = _.random(768000, 1024000)
    flow = {
      time: now - (j * 60000),
      inTraffic: inTraffic,
      inPacket: Math.floor(inTraffic/340),
      outTraffic: outTraffic,
      outPacket: Math.floor(outTraffic/340)
    }
    flows.push(flow)
  }
  return flows
}

module.exports  = {
  projectVNTraffic: projectVNTraffic
}