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
      'mouseover .link': '_onMouseoverLink',
      'mouseout .link': '_onMouseoutLink',
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
    if (!this.params.topMargin) {
      this.params.topMargin = 5
    }
  }

  _prepareLayout () {
    const data = this.model.get('data')
    const nodeNameMap = {}
    const parseConfig = this.config.get('parseConfig')
    let valueSum = 0
    this.nodes = []
    this.links = []
    _.each(data, (d) => {
      // Parsing a data element should return an array of links: { source: 'sourceNodeName', target: 'targetNodeName', value: value }
      const parsedLinks = parseConfig.parse(d)
      _.each(parsedLinks, (link, i) => {
        if (!link.value || link.value <= 0) {
          return
        }
        valueSum += link.value
        if (!nodeNameMap[link.source]) {
          const node = { name: link.source, label: link.sourceNode.label, level: link.sourceNode.level, index: this.nodes.length }
          nodeNameMap[link.source] = node
          this.nodes.push(node)
        }
        if (!nodeNameMap[link.target]) {
          const node = { name: link.target, label: link.targetNode.label, level: link.targetNode.level, index: this.nodes.length }
          nodeNameMap[link.target] = node
          this.nodes.push(node)
        }
        const sourceIndex = nodeNameMap[link.source].index
        const targetIndex = nodeNameMap[link.target].index
        let foundLink = null
        // Check if this link already exists.
        _.each(this.links, (uniqueLink) => {
          if ((uniqueLink.source === sourceIndex && uniqueLink.target === targetIndex) || (uniqueLink.source === targetIndex && uniqueLink.target === sourceIndex)) {
            foundLink = uniqueLink
          }
        })
        if (foundLink) {
          foundLink.value += link.value
        }
        else {
          this.links.push({ source: sourceIndex, target: targetIndex, value: link.value, data: link })
        }
      })
    })
    // Rescale the link values.
    // Does not look good - the sum of incomming values will not equal sum of outgoing values and the outgoing link will be thinner than the sum of incomming ones.
    // This needs to be handled during data parsing (ie. by the user) because only the user knows which data is input (in our example the input is from port to ip).
    /*
    console.log('valueSum, chartHeight: ', valueSum, this.params.chartHeight)
    const valueScale = this.config.get('valueScale').domain([1, valueSum]).range([1, this.params.chartHeight])
    _.each(this.links, (link) => {
      link.originalValue = link.value
      link.value = valueScale(link.originalValue)
    })
    */
    this.sankey = d3Sankey.sankey().nodeWidth(this.params.nodeWidth).nodePadding(this.params.nodePadding).size([this.params.chartWidth - 2 * this.params.labelMargin, this.params.chartHeight - 2 * this.params.topMargin])
    this.sankey
      .nodes(this.nodes)
      .links(this.links)
      .layout(32)
    //console.log('nodes: ', this.nodes)
    //console.log('links: ', this.links)
  }

   _render () {
    this.d3.attr('transform', `translate(${this.params.labelMargin}, ${this.params.topMargin})`)
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
    const svgNodesEdit = svgNodesEnter.merge(svgNodes).transition().ease(this.config.get('ease')).duration(this.params.duration)
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
    svgNodesEdit.select('rect')
      .style('fill', (d) => this.config.getColor([], this.config.get('levels')[d.level]))
      .attr('width', this.sankey.nodeWidth())
      .attr('height', (d) => d.dy)
    svgNodesEdit.select('text')
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

  _onMouseoverLink (d, el) {
    const [left, top] = d3Selection.mouse(this._container)
    this._actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d)
  }

  _onMouseoutLink (d, el) {
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
