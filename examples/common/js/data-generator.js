/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

// Data generator for examples

function projectVNTraffic (p = {}) {
  const data = []
  const dataConfig = p || {}

  const vnCount = dataConfig['vnCount'] || 3
  const flowCount = dataConfig['flowCount'] || 50
  const portCount = dataConfig['portCount'] || 10
  const now = _.now()

  let vnName = ''
  let vn = {}

  for (let j = 0; j < vnCount; j++) {
    vnName = 'virtual-network' + (j + 1)
    vn = {
      vnName: vnName,
      vmiCount: _.random(2, 20),
      flows: generateFlows4VN(flowCount, now),
      ports: generatePorts4VN(portCount, vnName)
    }
    data.push(vn)
  }

  return data
}

function generateFlows4VN (flowCount, now) {
  let flows = []
  let flow = {}

  let inTraffic = 0
  let outTraffic = 0

  for (let j = 0; j < flowCount; j++) {
    inTraffic = _.random(256000, 1024000)
    outTraffic = _.random(256000, 1024000)
    flow = {
      time: now - (j * 60000),
      inTraffic: inTraffic,
      inPacket: Math.floor(inTraffic / 340),
      outTraffic: outTraffic,
      outPacket: Math.floor(outTraffic / 340)
    }
    flows.push(flow)
  }
  return flows
}

function generatePorts4VN (portCount, vnName) {
  let ports = []
  let port = {}

  let inTraffic = 0
  let outTraffic = 0

  for (let j = 0; j < portCount; j++) {
    inTraffic = _.random(1024, 76800)
    outTraffic = _.random(1024, 76800)
    port = {
      vnName: vnName,
      port: _.random(7000, 55535),
      inTraffic: inTraffic,
      inPacket: Math.floor(inTraffic / 340),
      outTraffic: outTraffic,
      outPacket: Math.floor(outTraffic / 340)
    }
    ports.push(port)
  }
  return ports
}

module.exports = {
  projectVNTraffic: projectVNTraffic
}
