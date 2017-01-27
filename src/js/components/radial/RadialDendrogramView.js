/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const shape = require('d3-shape')
const ContrailChartsView = require('contrail-charts-view')

class RadialDendrogramView extends ContrailChartsView {
  get tagName () { return 'g' }
  get className () { return 'coCharts-radial-dendrogram' }
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
  }

  _prepareHierarchy () {
    const data = this.model.get('data')
    const hierarchyConfig = this.config.get('hierarchyConfig')
    const rootNode = {
      name: 'root',
      children: []
    }

    _.each(data, (d) => {
      // Parsing a data element may return many leaf nodes.
      let leafs = hierarchyConfig.parse(d)
      if (_.isArray(leafs)) {
        leafs = [leafs]
      }
      _.each(leafs, (leaf) => {
        // leaf node contains an array of 'names' (ie. the path from root to leaf) and a 'value'
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
      })
      console.log('rootNode: ', rootNode)
    })
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
