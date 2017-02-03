/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const simpleStatic = []
{
  const data = simpleStatic
  const length = 20
  for (let i = 1; i <= length; i++) {
    // Repeating region
    // if (i > Math.floor(length * 0.3) && i < Math.floor(length * 0.5)) data.push(data[i - 2])
    // Gap between data
    if (i > Math.floor(length * 0.5) && i < Math.floor(length * 0.7)) continue
    const datum = {
      t: 1475760930000 + 1000000 * i,
      // Integer
      x: i,
      a: i * 3,
      b: i * 5,
      c: i * 7,
      random: Math.random(),
      // some negative numbers
      randomN: Math.random() > 0.7 ? -Math.random() : Math.random(),
      random5: Math.random() * 5,
      random10: Math.random() * 10,
    }
    // Linear region of 'a'
    if (i > Math.floor(length * 0.3) && i < Math.floor(length * 0.4)) {
      datum.a = data[i - 2].a
    }
    data.push(datum)
  }
}

module.exports = {
  simpleStatic,
}
