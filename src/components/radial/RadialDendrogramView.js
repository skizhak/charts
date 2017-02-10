/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
require('./radial-dendogram.scss')
const _ = require('lodash')
const d3 = require('d3')
const shape = require('d3-shape')
const ContrailChartsView = require('contrail-charts-view')

class RadialDendrogramView extends ContrailChartsView {
  get tagName () { return 'g' }
  get className () { return 'radial-dendrogram' }
  get events () {
    return {
      'mouseover .arc': '_onMouseover',
      'mouseout .arc': '_onMouseout',
    }
  }

  constructor (p = {}) {
    super(p)
    this.listenTo(this.model, 'change', this._onDataModelChange)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    window.addEventListener('resize', _.throttle(() => { this.render() }, 100))
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this._onDataModelChange)
  }

  render () {
    this.resetParams()
    this._calculateDimensions()
    this._prepareHierarchy()
    super.render()
    this._render()
  }

  _calculateDimensions () {
    if (!this.params.chartWidth) {
      this.params.chartWidth = this._container.getBoundingClientRect().width
    }
    if (this.params.chartWidthDelta) {
      this.params.chartWidth += this.params.chartWidthDelta
    }
    if (!this.params.chartHeight) {
      this.params.chartHeight = this.params.chartWidth
    }
    if (!this.params.radius) {
      this.params.radius = this.params.chartWidth / 2
    }
    if (!this.params.labelMargin) {
      this.params.labelMargin = 50
    }
  }

  _prepareHierarchy () {
    const data = this.model.get('data')
    const hierarchyConfig = this.config.get('hierarchyConfig')
    const innerRadius = this.params.radius - this.params.labelMargin
    const rootNode = {
      name: 'root',
      children: []
    }
    let valueSum = 0
    _.each(data, (d, index) => {
      const leafs = hierarchyConfig.parse(d)
      // Parsing a data element should return a 2 element array: [source, destination]
      _.each(leafs, (leaf, i) => {
        // leaf node contains an array of 'names' (ie. the path from root to leaf) and a 'value'
        if (leaf.value <= 0) {
          return
        }
        let children = rootNode.children
        let node = null
        _.each(leaf.names, (name) => {
          node = _.find(children, (child) => child.name === name)
          if (!node) {
            node = {
              name: name,
              children: []
            }
            children.push(node)
          }
          children = node.children
        })
        // Now 'node' is the leaf
        delete node.children
        if (_.has(node, 'value')) {
          console.log('Leaf has value: ', node.key, leaf.key)
        }
        node.value = leaf.value
        node.type = (i === 0) ? 'src' : 'dst'
        node.index = index
        node.id = 'i' + index
        node.key = leaf.key
        valueSum += node.value
      })
    })
    console.log('rootNode: ', rootNode, valueSum)
    const valueScale = this.config.get('valueScale').domain([1,valueSum]).range([0,360])
    console.log('valueScale: ', valueScale, valueScale(valueSum/2))
    const hierarchyRootNode = d3.hierarchy(rootNode).sum((d) => valueScale(d.value)).sort((a, b) => b.value - a.value)
    console.log('hierarchyRootNode: ', hierarchyRootNode)
    // Creat a map of destination nodes
    const destinations = {}
    let maxDepth = 0
    _.each(hierarchyRootNode.leaves(), (leaf) => {
      maxDepth = Math.max(maxDepth, leaf.depth)
      if (leaf.data.type === 'dst') {
        destinations[leaf.data.id] = leaf
      }
    })
    // For every source node create a link to its destination.
    const links = []
    _.each(hierarchyRootNode.leaves(), (leaf) => {
      if (leaf.data.type === 'src') {
        links.push(leaf.path(destinations[leaf.data.id]))
      }
    })
    this.links = links
    console.log('maxDepth: ', maxDepth)
    console.log('Links: ', links)
    const extraPaddingPerDepth = _.fill(_.range(maxDepth+1), 0)
    // Create the cluster layout.
    const cluster = d3.cluster().size([360, innerRadius])
    //const cluster = d3.tree().size([360, innerRadius])
    .separation((a, b) => {
      let distance = (a.value + b.value) / 2
      if (a.parent !== b.parent) {
        // Count how many ancestors differ the two nodes.
        const aAncestors = a.ancestors()
        const bAncestors = b.ancestors()
        const differences = Math.max(0, _.difference(aAncestors, bAncestors).length - this.params.parentSeparationDepthThreshold)
        const extraPadding = this.params.parentSeparation * differences * hierarchyRootNode.value / 360
        distance += extraPadding
        extraPaddingPerDepth[a.depth] += extraPadding
      }
      return distance
    })
    console.log('extraPaddingPerDepth: ', extraPaddingPerDepth)
    console.log('cluster: ', cluster(hierarchyRootNode))
    this.cluster = cluster
    // Create circles
    const circles = []
    hierarchyRootNode.each((n) => {
      const valueAngle = n.value * 360 / (hierarchyRootNode.value + extraPaddingPerDepth[n.depth])
      n.startAngle = n.x - valueAngle / 2
      n.endAngle = n.x + valueAngle / 2
      if (circles.length === n.depth) {
        circles[n.depth] = { r: n.y }
      }
    })
    this.circles = circles
    console.log('circles: ', circles)
    // Create grouped links
    /*
    const groupedLinks = []
    _.each(links, (link) => {
      _.each(link, (origin, index) => {
        if (index <= 1 && index + 1 < link.length) {
        //if (index == 0) {          
          // source is the lower node
          let source = link[index]
          let target = link[index + 1]
          if (source.depth < target.depth) {
            target = link[index]
            source = link[index + 1]
          }
          let sourceStartAngle = source.startAngle
          let foundChild = false
          if (source.children) {
            _.each(source.children, (child) => {
              if (foundChild) {
                return
              }
              if (child.parent === source) {
                foundChild = true
              }
              else {
                sourceStartAngle += child.endAngle - child.startAngle
              }
            })
          }

          let targetStartAngle = target.startAngle
          foundChild = false
          _.each(target.children, (child) => {
            if (foundChild) {
              return
            }
            if (child === source) {
              foundChild = true
            }
            else {
              targetStartAngle += child.endAngle - child.startAngle
            }
          })
          const groupedLink = {
            source: {
              startAngle: sourceStartAngle * Math.PI / 180,
              endAngle: (sourceStartAngle + (link[0].endAngle - link[0].startAngle)) * Math.PI / 180,
              radius: source.y
            },
            target: {
              startAngle: targetStartAngle * Math.PI / 180,
              endAngle: (targetStartAngle + (link[0].endAngle - link[0].startAngle)) * Math.PI / 180,
              radius: target.y
            },
            key: link[0].data.key
          }
          groupedLinks.push(groupedLink)
        }
      })
    })
    this.groupedLinks = groupedLinks
    console.log('groupedLinks: ', groupedLinks)
    */
    // For every leaf create a series of connections to the root.
    /*
    const valuePerLevel = 1.1 * hierarchyRootNode.value
    const angleScale = d3.scaleLinear().domain( [0, valuePerLevel] ).range( [0, 360] )
    _.each(hierarchyRootNode.leaves(), (leaf) => {
      const key = leaf.key
      const leafAngleValue = angleScale(leaf.value)
      _.each(leaf.ancestors(), (ancestor) => {
        if (!_.has(ancestor, 'startAlpha')) {
          ancestor.startAlpha = ancestor.x
          ancestor.endAlpha = ancestor.x
        }
        ancestor.startAlpha -= leafAngleValue / 2
        ancestor.endAlpha += leafAngleValue / 2
      })
    })
    const groupedLinks = []
    _.each(hierarchyRootNode.leaves(), (leaf) => {
      const key = leaf.key
      const leafAngleValue = angleScale(leaf.value)
      let prevoiusGroupedLink = null
      _.each(leaf.ancestors(), (ancestor) => {
        if (!_.has(ancestor, 'offsetAlpha')) {
          ancestor.offsetAlpha = ancestor.startAlpha
        }
        if (ancestor.depth > 0) {
          const groupedLink = {
            polarPoints: [[ancestor.offsetAlpha, ancestor.y], [ancestor.offsetAlpha + leafAngleValue, ancestor.y]],
            depth: ancestor.depth,
            r: ancestor.y,
            key: key
          }
          if (prevoiusGroupedLink) {
            prevoiusGroupedLink.polarPoints.push([ancestor.offsetAlpha + leafAngleValue, ancestor.y])
            prevoiusGroupedLink.polarPoints.push([ancestor.offsetAlpha, ancestor.y])
          }
          prevoiusGroupedLink = groupedLink
          groupedLinks.push(groupedLink)
        }
        else {
          if (prevoiusGroupedLink) {
            prevoiusGroupedLink.polarPoints.push([0, 0])
            prevoiusGroupedLink.polarPoints.push([0, 0])
          }
        }
        ancestor.offsetAlpha += leafAngleValue
      })
    })
    this.groupedLinks = groupedLinks
    console.log('groupedLinks: ', groupedLinks)
    */
    const depthValueOffset = [0]
    hierarchyRootNode.angleRange = [0, 360]
    hierarchyRootNode.valueRange = [0, hierarchyRootNode.value]
    hierarchyRootNode.angleScale = d3.scaleLinear().domain(hierarchyRootNode.valueRange).range(hierarchyRootNode.angleRange)
    hierarchyRootNode.each((n) => {
      if (!n.parent) {
        return
      }
      if (depthValueOffset.length <= n.depth) {
        depthValueOffset.push(0)
      }
      const minValue = depthValueOffset[n.depth]
      const maxValue = minValue + n.value
      depthValueOffset[n.depth] = maxValue
      n.valueRange = [minValue, maxValue]
      //const parentAngleScale = d3.scaleLinear().domain(n.parent.valueRange).range(n.parent.angleRange)
      let minAngle = n.parent.angleScale(minValue)
      let maxAngle = n.parent.angleScale(maxValue)
      // Shrink the angle range in order to create padding between nodes.
      n.separationValue = 0
      if (n.depth < this.params.parentSeparationDepthThreshold) {
        /*
        if ((maxAngle - minAngle) > this.params.parentSeparation) {
          n.separationValue = this.params.parentSeparation
        }
        else {
          n.separationValue = 0.9 * (maxAngle - minAngle)
        }
        */
        n.separationValue = this.params.parentSeparationShrinkFactor * (maxAngle - minAngle) / 2
      }
      minAngle += n.separationValue
      maxAngle -= n.separationValue
      n.angleRange = [minAngle, maxAngle]
      n.angleScale = d3.scaleLinear().domain(n.valueRange).range(n.angleRange)
    })
    // Now shrink the parent nodes by the amount of sepration added to children.
    hierarchyRootNode.each((n) => {
      if (!n.parent) {
        return
      }
      let separationValueOfChildren = 0
      _.each(n.descendants(), (child) => {
        separationValueOfChildren += child.separationValue
      })
      n.angleRange[0] += separationValueOfChildren
      n.angleRange[1] -= separationValueOfChildren
      n.angleScale = d3.scaleLinear().domain(n.valueRange).range(n.angleRange)
    })
    const groupedLinks = []
    let valueOffset = 0
    _.each(hierarchyRootNode.leaves(), (leaf) => {
      const key = leaf.data.key
      _.each(leaf.ancestors(), (n) => {
        if (n.depth > 1) {
          const groupedLink = {
            polarPoints: [[n.angleScale(valueOffset), n.y], [n.angleScale(valueOffset + leaf.value), n.y]],
            depth: n.depth,
            r: n.y,
            key: key
          }
          groupedLink.polarPoints.push([n.parent.angleScale(valueOffset + leaf.value), n.parent.y])
          groupedLink.polarPoints.push([n.parent.angleScale(valueOffset), n.parent.y])
          groupedLinks.push(groupedLink)
        }
      })
      //console.log('Leaf: ', leaf.valueRange[0], valueOffset)
      valueOffset += leaf.value
    })
    this.groupedLinks = groupedLinks
    console.log('groupedLinks: ', groupedLinks)

    this.ribbons = []
    _.each(this.links, (link) => {
      const src = link[0]
      const dst = link[link.length-1]
      const srcAncestors = src.ancestors()
      const dstAncestors = dst.ancestors()
      const outerPoints = []
      _.each(srcAncestors, (n, i) => {
        if (n.parent) {
          let valueStart = n.valueRange[0]
          if (n.children) {
            let found = false
            const leaves = n.leaves()
            _.each(leaves, (child) => {
              if (child == src) {
                found = true
              }
              if (!found) {
                valueStart += child.valueRange[1] - child.valueRange[0]
              }
            })
            if (!found) {
              console.log('Never found')
            }
          }
          outerPoints.push([n.angleScale(valueStart), n.y])
        }
      })
      let i = 0
      for(i = dstAncestors.length-1; i >= 0; i--) {
        let n = dstAncestors[i]
        if (n.parent) {
          let valueStart = n.valueRange[1]
          if (n.children) {
            let found = false
            let ci = 0
            const leaves = n.leaves()
            for(ci = leaves.length-1; ci >= 0; ci--) {
              let child = leaves[ci]
              if (child == dst) {
                found = true
              }
              if (!found) {
                valueStart -= child.valueRange[1] - child.valueRange[0]
              }
            }
            if (!found) {
              console.log('Never found')
            }
          }
          outerPoints.push([n.angleScale(valueStart), n.y])
        }
      }
      const innerPoints = []
      _.each(dstAncestors, (n, i) => {
        if (n.parent) {
          let valueStart = n.valueRange[0]
          if (n.children) {
            let found = false
            const leaves = n.leaves()
            _.each(leaves, (child) => {
              if (child == dst) {
                found = true
              }
              if (!found) {
                valueStart += child.valueRange[1] - child.valueRange[0]
              }
            })
            if (!found) {
              console.log('Never found')
            }
          }
          innerPoints.push([n.angleScale(valueStart), n.y])
        }
      })
      for(i = srcAncestors.length-1; i >=0; i-- ) {
        let n = srcAncestors[i]
        if (n.parent) {
          let valueStart = n.valueRange[1]
          if (n.children) {
            let found = false
            let ci = 0
            const leaves = n.leaves()
            for(ci = leaves.length-1; ci >= 0; ci--) {
              let child = leaves[ci]
              if (child == src) {
                found = true
              }
              if (!found) {
                valueStart -= child.valueRange[1] - child.valueRange[0]
              }
            }
          }
          innerPoints.push([n.angleScale(valueStart), n.y])
        }
      }
      this.ribbons.push({
        outerPoints: outerPoints,
        innerPoints: innerPoints,
        key: src.data.key
      })
    })
    console.log('ribbons: ', this.ribbons)

    const arcs = []
    hierarchyRootNode.each((n) => {
      if (!n.parent || !n.children) {
        return
      }
      arcs.push(n)
    })
    this.arcs = arcs
  }

  _render () {
    this.d3.attr('transform', `translate(${this.params.chartWidth / 2}, ${this.params.chartHeight / 2})`)
    // Circles
    const svgCircles = this.d3.selectAll('.circle').data(this.circles)
    svgCircles.enter().append('circle')
      .attr('class', 'circle')
      .attr('r', 0)
    .merge(svgCircles)
      .attr('r', (d) => d.r + 1)

    if (this.params.drawLinks) {
      // Links
      const radialLine = d3.radialLine().angle((d) => d.x / 180 * Math.PI).radius((d) => d.y).curve(this.config.get('curve'))
      const svgLinks = this.d3.selectAll('.link').data(this.links)
      svgLinks.enter().append('path')
        .attr('class', (d) => 'link ' + d[0].data.key)
        .style('stroke-width', 0)
        .attr('d',(d) => radialLine(d[0]))
      .merge(svgLinks)
        .style('stroke-width', (d) => ( d[0].y * Math.sin((d[0].endAngle - d[0].startAngle) * Math.PI / 180)) + 'px')
        .attr('d', radialLine)
    }
    if (this.params.drawRibbons) {
      // Ribbons
      const radialLine = d3.radialLine().angle((d) => d[0] / 180 * Math.PI).radius((d) => d[1]).curve(this.config.get('curve'))
      const svgLinks = this.d3.selectAll('.ribbon').data(this.ribbons)
      svgLinks.enter().append('path')
        .attr('class', (d) => 'ribbon ' + d.key)
        .merge(svgLinks)
        .attr('d', (d) => {
          /*
          const x0 = d.polarPoints[0][1] * Math.cos(Math.PI * d.polarPoints[0][0] / 180)
          const x1 = d.polarPoints[1][1] * Math.cos(Math.PI * d.polarPoints[1][0] / 180)
          const x2 = d.polarPoints[2][1] * Math.cos(Math.PI * d.polarPoints[2][0] / 180)
          const x3 = d.polarPoints[3][1] * Math.cos(Math.PI * d.polarPoints[3][0] / 180)
          const y0 = d.polarPoints[0][1] * Math.sin(Math.PI * d.polarPoints[0][0] / 180)
          const y1 = d.polarPoints[1][1] * Math.sin(Math.PI * d.polarPoints[1][0] / 180)
          const y2 = d.polarPoints[2][1] * Math.sin(Math.PI * d.polarPoints[2][0] / 180)
          const y3 = d.polarPoints[3][1] * Math.sin(Math.PI * d.polarPoints[3][0] / 180)
          return 'M' + x0 + ',' + y0 + 'L' + x1 + ',' + y1 + 'L' + x2 + ',' + y2 + 'L' + x3 + ',' + y3 + 'Z'
          */
          const outerPath = radialLine(d.outerPoints)
          const innerPath = radialLine(d.innerPoints)
          return outerPath + 'L' + innerPath.substr(1) + 'Z'
        })

      // Arcs for parent nodes.
      const arc = d3.arc()
        .innerRadius((n) => n.y - 5)
        .outerRadius((n => n.y + 5))
        .startAngle((n) => Math.PI * n.angleRange[0] / 180)
        .endAngle((n) => Math.PI * n.angleRange[1] / 180)
      const svgArcs = this.d3.selectAll('.arc').data(this.arcs)
      svgArcs.enter().append('path')
        .attr('class', (d) => 'arc ' + d.data.name)
        .merge(svgArcs)
        .attr('d', arc)
    }
  }

  // Event handlers

  _onDataModelChange () {
    this.render()
  }

  _onConfigModelChange () {
    this.render()
  }

  _onMouseover (sector, el) {
  }

  _onMouseout (d, el) {
  }
}

module.exports = RadialDendrogramView
