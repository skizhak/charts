/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import './radial-dendogram.scss'
import _ from 'lodash'
import 'd3'
import ContrailChartsView from 'contrail-charts-view'

export default class RadialDendrogramView extends ContrailChartsView {
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
    if (!this.params.innerRadius ) {
      this.params.innerRadius = this.params.radius - this.params.labelMargin
    }
  }

  _prepareRootNode () {
    const data = this.model.get('data')
    const hierarchyConfig = this.config.get('hierarchyConfig')
    const leafNodes = []
    // The root node of the hierarchy (tree) we are building.
    this.rootNode = {
      name: 'root',
      children: []
    }
    this.valueSum = 0
    _.each(data, (d, index) => {
      // Parsing a data element should return a 2 element array: [source, destination]
      const leafs = hierarchyConfig.parse(d)
      if (leafs[0].value <= 0 || leafs[1].value <= 0) {
        return
      }
      // Check if we havent already created a node pair (link) with the same id.
      const foundLeafNode = _.find(leafNodes, (leafNode) => {
        let found = false
        if (leafNode.id === leafs[0].id) {
          if (leafNode.otherNode.id === leafs[1].id) {
            found = true
          }
        }
        if (leafNode.id === leafs[1].id) {
          if (leafNode.otherNode.id === leafs[0].id) {
            found = true
          }
        }
        return found
      })
      if (foundLeafNode) {
        foundLeafNode.value += (foundLeafNode.id === leafs[0].id) ? leafs[0].value : leafs[1].value
        foundLeafNode.otherNode.value += (foundLeafNode.otherNode.id === leafs[0].id) ? leafs[0].value : leafs[1].value
        this.valueSum += leafs[0].value + leafs[1].value
      }
      else {
        _.each(leafs, (leaf, i) => {
          // leaf node contains an array of 'names' (ie. the path from root to leaf) and a 'value'
          let children = this.rootNode.children
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
          // Now 'node' is one before leaf
          const leafNode = {
            id: leaf.id,
            otherNode: (i === 0) ? leafs[1] : leafs[0],
            value: leaf.value,
            type: (i === 0) ? 'src' : 'dst',
            linkId: leafs[0].id + '-' + leafs[1].id,
          }
          node.children.push(leafNode)
          this.valueSum += leafNode.value
          leafNodes.push(leafNode)
        })
      }
    })
    //console.log('rootNode: ', this.rootNode, this.valueSum)
  }

  _prepareHierarchyRootNode () {
    const valueScale = this.config.get('valueScale').domain([0.01,this.valueSum]).range([0,360])
    this.hierarchyRootNode = d3.hierarchy(this.rootNode).sum((d) => valueScale(d.value)).sort((a, b) => b.value - a.value)
    //console.log('hierarchyRootNode: ', this.hierarchyRootNode)
  }

  _prepareLinks () {
    this.links = []
    this.maxDepth = 0
    let i = 0
    const leaves = this.hierarchyRootNode.leaves()
    _.each(leaves, (leaf, leafIndex) => {
      this.maxDepth = Math.max(this.maxDepth, leaf.depth)
      for(i = leafIndex + 1; i < leaves.length; i++) {
        if (leaf.data.linkId === leaves[i].data.linkId) {
          this.links.push(leaf.path(leaves[i]))
        }
      }
    })
    //console.log('maxDepth: ', this.maxDepth)
    //console.log('Links: ', this.links)
  }

  _prepareCluster () {

    const extraPaddingPerDepth = _.fill(_.range(this.maxDepth+1), 0)
    // Create the cluster layout.
    const cluster = d3.cluster().size([360, this.params.innerRadius])
    //const cluster = d3.tree().size([360, this.params.innerRadius])
    .separation((a, b) => {
      let distance = (a.value + b.value) / 2
      if (a.parent !== b.parent) {
        // Count how many ancestors differ the two nodes.
        const aAncestors = a.ancestors()
        const bAncestors = b.ancestors()
        const differences = Math.max(0, _.difference(aAncestors, bAncestors).length - this.params.parentSeparationDepthThreshold)
        const extraPadding = this.params.parentSeparation * differences * this.hierarchyRootNode.value / 360
        distance += extraPadding
        extraPaddingPerDepth[a.depth] += extraPadding
      }
      return distance
    })
    cluster(this.hierarchyRootNode)
  }

  _prepareCircles () {
    this.circles = []
    const radiusScale = d3.scaleLinear().domain([0, this.maxDepth-1]).range([0, this.params.innerRadius]).clamp(true)
    this.hierarchyRootNode.each((n) => {
      if (!n.parent || !n.children) {
        return
      }
      n.y = radiusScale(n.depth)
      if (this.circles.length === n.depth) {
        this.circles[n.depth] = { r: n.y }
      }
    })
    //console.log('circles: ', this.circles)
  }

  _prepareAngleRanges () {
    const depthValueOffset = [0]
    this.hierarchyRootNode.angleRange = [0, 360]
    this.hierarchyRootNode.valueRange = [0, this.hierarchyRootNode.value]
    this.hierarchyRootNode.angleScale = d3.scaleLinear().domain(this.hierarchyRootNode.valueRange).range(this.hierarchyRootNode.angleRange)
    this.hierarchyRootNode.each((n) => {
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
      let minAngle = n.parent.angleScale(minValue)
      let maxAngle = n.parent.angleScale(maxValue)
      // Shrink the angle range in order to create padding between nodes.
      n.separationValue = 0
      if (n.depth < this.params.parentSeparationDepthThreshold) {
        n.separationValue = this.params.parentSeparationShrinkFactor * (maxAngle - minAngle) / 2
      }
      minAngle += n.separationValue
      maxAngle -= n.separationValue
      n.angleRange = [minAngle, maxAngle]
      n.angleScale = d3.scaleLinear().domain(n.valueRange).range(n.angleRange)
    })
    // Now shrink the parent nodes by the amount of sepration added to children.
    this.hierarchyRootNode.each((n) => {
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
  }

  _prepareRibbons () {
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
              //console.log('Never found')
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
              //console.log('Never found')
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
              //console.log('Never found')
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
        id: src.data.linkId
      })
    })
    //console.log('ribbons: ', this.ribbons)
  }

  _prepareArcs () {
    this.arcs = []
    this.hierarchyRootNode.each((n) => {
      if (!n.parent || !n.children) {
        return
      }
      this.arcs.push(n)
    })
  }

  _prepareHierarchy () {
    this._prepareRootNode()
    this._prepareHierarchyRootNode()
    this._prepareLinks()
    this._prepareCluster()
    this._prepareCircles()
    this._prepareAngleRanges()
    this._prepareRibbons()
    this._prepareArcs()
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
        .attr('class', (d) => 'link ' + d[0].data.id)
        .style('stroke-width', 0)
        .attr('d',(d) => radialLine(d[0]))
      .merge(svgLinks)
        .style('stroke-width', (d) => ( d[0].y * Math.sin((d[0].angleRange[1] - d[0].angleRange[0]) * Math.PI / 180)) + 'px')
        .attr('d', radialLine)
    }
    if (this.params.drawRibbons) {
      // Ribbons
      const radialLine = d3.radialLine().angle((d) => d[0] / 180 * Math.PI).radius((d) => d[1]).curve(this.config.get('curve'))
      const svgLinks = this.d3.selectAll('.ribbon').data(this.ribbons)
      svgLinks.enter().append('path')
        .attr('class', 'ribbon')
        .merge(svgLinks)
        .attr('class', (d) => 'ribbon' + ((d.active) ? ' active' : '') )
        .attr('d', (d) => {
          const outerPath = radialLine(d.outerPoints)
          const innerPath = radialLine(d.innerPoints)
          return outerPath + 'L' + innerPath.substr(1) + 'Z'
        })

      // Arcs for parent nodes.
      const arc = d3.arc()
        .innerRadius((n) => n.y)
        .outerRadius((n => n.y + 10))
        .startAngle((n) => Math.PI * n.angleRange[0] / 180)
        .endAngle((n) => Math.PI * n.angleRange[1] / 180)
      const svgArcs = this.d3.selectAll('.arc').data(this.arcs)
      svgArcs.enter().append('path')
        .attr('class', (d) => 'arc arc-' + d.depth)
        .style('fill', (d) => this.config.get('colorScale')(d.depth))
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

  _onMouseover (d, el) {
    const leaves = d.leaves()
    _.each(this.ribbons, (ribbon) => {
      const found = _.find(leaves, (leaf) => leaf.data.linkId === ribbon.id)
      ribbon.active = (found) ? true : false
    })
    this._render()
  }

  _onMouseout (d, el) {
    _.each(this.ribbons, (ribbon) => {
      ribbon.active = false
    })
    this._render()
  }
}
