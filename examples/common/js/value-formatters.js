/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const d3Format = require('d3-format')
const d3TimeFormat = require('d3-time-format')
const extendedISOTime = d3TimeFormat.timeFormat('%H:%M:%S')
const toInteger = d3Format.format('.0f')
const toFixed1 = d3Format.format('.1f')
const commaGroupedInteger = d3Format.format(',.0f')

function toFixedNumberFactory (digits) {
  return d3Format.format(`.${digits}f`)
}

function byteFormatter1K (bytes) {
  const unit = 1024

  bytes *= 1024

  if (bytes < 0) bytes *= -1
  if (bytes < unit) return bytes + ' B'

  const scale = Math.floor(Math.log(bytes) / Math.log(unit))
  const unitPre = 'KMGTPE'.substr(scale - 1, 1)

  return `${(bytes / Math.pow(unit, scale)).toFixed(1)} ${unitPre}B`
}

function byteFormatter (bytes) {
  const unit = 1024

  if (bytes < 0) bytes *= -1
  if (bytes < unit) return bytes + ' B'

  const scale = Math.floor(Math.log(bytes) / Math.log(unit))
  const unitPre = 'KMGTPE'.substr(scale - 1, 1)

  return `${(bytes / Math.pow(unit, scale)).toFixed(1)} ${unitPre}B`
}

function toFixedPercentage1 (number) {
  return number.toFixed(1) + '%'
}

module.exports = {
  extendedISOTime,
  toInteger,
  toFixed1,
  toFixedNumberFactory,
  commaGroupedInteger,
  byteFormatter,
  toFixedPercentage1,
  byteFormatter1K
}
