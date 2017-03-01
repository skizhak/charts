/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import './sankey.scss'
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Selection from 'd3-selection'
import * as d3Sankey from 'd3-sankey'
import ContrailChartsView from 'contrail-charts-view'

export default class SankeyView extends ContrailChartsView {
  get tagName () { return 'g' }
  get className () { return 'sankey' }
  get events () {
    return {
      'mouseover .arc': '_onMouseover',
      'mouseout .arc': '_onMouseout',
      'click .arc': '_arcClick'
    }
  }

  constructor (p = {}) {
    super(p)
    this.listenTo(this.model, 'change', this._onDataModelChange)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this._onDataModelChange)
  }

  render () {
    this.resetParams()
    this._calculateDimensions()
    this._prepareLayout()
    super.render()
    this._render()
    this._ticking = false
  }

  refresh () {
    this.config.trigger('change', this.config)
  }

  remove () {
    super.remove()
    window.removeEventListener('resize', this._onResize)
  }

  _calculateDimensions () {
    if (!this.params.chartWidth) {
      this.params.chartWidth = this._container.getBoundingClientRect().width
    }
    if (this.params.chartWidthDelta) {
      this.params.chartWidth += this.params.chartWidthDelta
    }
    if (!this.params.chartHeight) {
      this.params.chartHeight = 3 * this.params.chartWidth / 5
    }
    if (!this.params.labelMargin) {
      this.params.labelMargin = 50
    }
  }

  _prepareLayout () {
    const data = this.model.get('data')
    const nodeNameMap = {}
    const parseConfig = this.config.get('parseConfig')
    this.nodes = []
    this.links = []
    _.each(data, (d) => {
      // Parsing a data element should return an array of links: { source: 'sourceNodeName', target: 'targetNodeName', value: value }
      const parsedLinks = parseConfig.parse(d)
      _.each(parsedLinks, (link, i) => {
        if (!link.value || link.value <= 0) {
          return
        }
        if (!nodeNameMap[link.source]) {
          const node = { name: link.source, label: link.sourceNode.label, index: this.nodes.length }
          nodeNameMap[link.source] = node
          this.nodes.push(node)
        }
        if (!nodeNameMap[link.target]) {
          const node = { name: link.target, label: link.targetNode.label, index: this.nodes.length }
          nodeNameMap[link.target] = node
          this.nodes.push(node)
        }
        this.links.push({ source: nodeNameMap[link.source].index, target: nodeNameMap[link.target].index, value: link.value })
      })
    })
    this.sankey = d3Sankey.sankey().nodeWidth(15).nodePadding(1).size([this.params.chartWidth - 2 * this.params.labelMargin, this.params.chartHeight])
    this.sankey
      .nodes(this.nodes)
      .links(this.links)
      .layout(32)
    console.log('nodes: ', this.nodes)
    console.log('links: ', this.links)
  }

   _render () {
    this.d3.attr('transform', `translate(${this.params.labelMargin}, 0)`)
    // Links
    const path = this.sankey.link()
    const svgLinks = this.d3.selectAll('.link').data(this.links)
    svgLinks.enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .merge(svgLinks)
      .attr('d', path)
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
    svgLinks.exit().remove()
    // Nodes
    const svgNodes = this.d3.selectAll('.node').data(this.nodes)
    const svgNodesEnter = svgNodes.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
    svgNodesEnter.append('rect')
      .attr('width', this.sankey.nodeWidth())
      .attr('height', (d) => d.dy)
    svgNodesEnter.append('text')
      .attr("x", -5)
      .attr("y", (d) => d.dy / 2)
      .attr("text-anchor", "end")
      .text((d) => d.dy > 10 ? d.label : '')
      .filter((d) => d.x > this.params.chartWidth / 2)
      .attr("x", 5 + this.sankey.nodeWidth())
      .attr("text-anchor", "start")
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
      ribbon.active = Boolean(_.find(leaves, (leaf) => leaf.data.linkId === ribbon.id))
    })
    this._render()
    const [left, top] = d3Selection.mouse(this._container)
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d.data)
  }

  _onMouseout (d, el) {
    _.each(this.ribbons, (ribbon) => {
      ribbon.active = false
    })
    this._render()
    this._actionman.fire('HideComponent', this.config.get('tooltip'))
  }

  _arcClick (d, el) {
    if (d.depth < this.maxDepth && d.depth === this.params.drillDownLevel) {
      // Expand
      this.config.set('drillDownLevel', this.params.drillDownLevel + 1)
    } else if (d.depth < this.params.drillDownLevel) {
      // Collapse
      this.config.set('drillDownLevel', this.params.drillDownLevel - 1)
    }
  }
}
