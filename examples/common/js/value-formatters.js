/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const d3Format = require('d3-format')
const d3TimeFormat = require('d3-time-format')

function extendedISOTime (value) {
  return d3TimeFormat.timeFormat('%H:%M:%S')(value)
}

function toInteger (number) {
  return number.toFixed(0)
}

function toFixed1 (number) {
  return number.toFixed(1)
}

function toFixedNumberFactory (digits) {
  return function (number) {
    return number.toFixed(digits)
  }
}

function commaGroupedInteger (number) {
  return d3Format.format(',.0f')(number)
}

function byteFormatter (bytes) {
  const unit = 1024

  if (bytes < 0) {
    bytes *= -1
  }

  if (bytes < unit) {
    return bytes + ' B'
  }

  const scale = Math.floor(Math.log(bytes) / Math.log(unit))
  const unitPre = 'KMGTPE'.substr(scale - 1, 1)

  return `${(bytes / Math.pow(unit, scale)).toFixed(1)} ${unitPre}B`
}

function toFixedPercentage1 (number) {
  return number.toFixed(1) + '%'
}

module.exports = {
  extendedISOTime: extendedISOTime,
  toInteger: toInteger,
  toFixed1: toFixed1,
  toFixedNumberFactory: toFixedNumberFactory,
  commaGroupedInteger: commaGroupedInteger,
  byteFormatter: byteFormatter,
  toFixedPercentage1: toFixedPercentage1,
}
