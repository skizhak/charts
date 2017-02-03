/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
require('./radial-dendogram.scss')
const _ = require('lodash')
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
        node.value = leaf.value
        node.type = (i === 0) ? 'src' : 'dst'
        node.index = index
        node.id = 'i' + index
        node.key = leaf.key
      })
    })
    console.log('rootNode: ', rootNode)

    const hierarchyRootNode = d3.hierarchy(rootNode).sum((d) => d.value ).sort( (a, b) => b.value - a.value)
    console.log('hierarchyRootNode: ', hierarchyRootNode)
    // Creat a map of destination nodes
    const destinations = {}
    _.each(hierarchyRootNode.leaves(), (leaf) => {
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
    // Create the cluster layout.
    const cluster = d3.cluster().size([360, innerRadius]).separation((a, b) => {
      let distance = (a.value + b.value) / 2
      if (a.parent !== b.parent) {
        // Count how many ancestors differ the two nodes.
        const aAncestors = a.ancestors()
        const bAncestors = b.ancestors()
        const differences = _.difference(aAncestors, bAncestors).length
        distance += this.params.parentSeparation * differences * hierarchyRootNode.value / 360
      }
      return distance
    })
    console.log('cluster: ', cluster(hierarchyRootNode))
    this.cluster = cluster
    // Create circles
    const circles = []
    hierarchyRootNode.each((n) => {
      if (circles.length === n.depth) {
        circles[n.depth] = { r: n.y }
      }
    })
    this.circles = circles
    console.log('circles: ', circles)
  }

  _render () {
    this.d3.attr('transform', `translate(${this.params.chartWidth / 2}, ${this.params.chartHeight / 2})`)
    // Links
    const radialLine = d3.radialLine().angle((d) => d.x / 180 * Math.PI).radius((d) => d.y).curve(this.config.get('curve'))
    const svgLinks = this.d3.selectAll('.link').data(this.links)
    svgLinks.enter().append('path')
      .attr('class', (d) => 'link ' + d[0].data.key)
      .attr('d',(d) => radialLine(d[0]))
    .merge(svgLinks)
      .attr('d',radialLine)
    // Circles
    const svgCircles = this.d3.selectAll('.circle').data(this.circles)
    svgCircles.enter().append('circle')
      .attr('class', 'circle')
      .attr('r', 0)
    .merge(svgCircles)
      .attr('r', (d) => d.r + 1)
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
