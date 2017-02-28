/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import './sankey.scss'
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Selection from 'd3-selection'
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
      this.params.chartHeight = this.params.chartWidth
    }
    if (!this.params.labelMargin) {
      this.params.labelMargin = 50
    }
  }

  _prepareLayout () {
    const data = this.model.get('data')
    const parseConfig = this.config.get('parseConfig')
    _.each(data, (d, index) => {
      // Parsing a data element should return an array of links: { source: 'sourceNodeName', target: 'targetNodeName', value: value }
      const links = parseConfig.parse(d)
      _.each(links, (link, i) => {
      })
    })
  }

   _render () {
    console.log('Sankey _render: ', this.d3)
    const svgCircles = this.d3.selectAll('.circle').data([{r:30}, {r:50}])
    svgCircles.enter().append('circle')
      .attr('class', 'circle')
      .attr('r', 0)
      .merge(svgCircles)
      .attr('r', (d) => d.r)
    svgCircles.exit().remove()
    /*
    this.d3.attr('transform', `translate(${this.params.chartWidth / 2}, ${this.params.chartHeight / 2})`)
    // Circles
    const svgCircles = this.d3.selectAll('.circle').data(this.circles)
    svgCircles.enter().append('circle')
      .attr('class', 'circle')
      .attr('r', 0)
      .merge(svgCircles)
      .attr('r', (d) => d.r + 1)
    svgCircles.exit().remove()

    if (this.params.drawLinks) {
      // Links
      const radialLine = d3Shape.radialLine().angle((d) => d.x / 180 * Math.PI).radius((d) => d.y).curve(this.config.get('curve'))
      const svgLinks = this.d3.selectAll('.link').data(this.links)
      svgLinks.enter().append('path')
        .attr('class', (d) => 'link ' + d[0].data.id)
        .style('stroke-width', 0)
        .attr('d', (d) => radialLine(d[0]))
      .merge(svgLinks)
        .style('stroke-width', (d) => (d[0].y * Math.sin((d[0].angleRange[1] - d[0].angleRange[0]) * Math.PI / 180)) + 'px')
        .attr('d', radialLine)
    }
    if (this.params.drawRibbons) {
      // Ribbons
      const radialLine = d3Shape.radialLine().angle((d) => d[0] / 180 * Math.PI).radius((d) => d[1]).curve(this.config.get('curve'))
      const svgLinks = this.d3.selectAll('.ribbon').data(this.ribbons, (d) => d.id)
      svgLinks.enter().append('path')
        .attr('class', (d) => 'ribbon' + ((d.active) ? ' active' : ''))
        .merge(svgLinks)// .transition().ease(this.config.get('ease')).duration(this.params.duration)
        .attr('class', (d) => 'ribbon' + ((d.active) ? ' active' : ''))
        .attr('d', (d) => {
          const outerPath = radialLine(d.outerPoints)
          const innerPath = radialLine(d.innerPoints)
          const innerStitch = 'A' + d.outerPoints[0][1] + ' ' + d.outerPoints[0][1] + ' 0 0 0 '
          const endingStitch = 'A' + d.outerPoints[0][1] + ' ' + d.outerPoints[0][1] + ' 0 0 0 ' + radialLine([d.outerPoints[0]]).substr(1)
          return outerPath + innerStitch + innerPath.substr(1) + endingStitch
        })
      svgLinks.exit().remove()

      // Arc labels
      const svgArcLabels = this.d3.selectAll('.arc-label').data(this.arcs)
      svgArcLabels.enter().append('text')
        .attr('x', this.params.arcLabelXOffset)
        .attr('dy', this.params.arcLabelYOffset)
        .append('textPath')
        .attr('class', 'arc-label')
        .attr('xlink:href', (d) => '#' + d.data.namePath.join('-'))
        // .attr('startOffset', '50%')
        .merge(svgArcLabels).transition().ease(this.config.get('ease')).duration(this.params.duration)
        .text((d) => (this.params.showArcLabels && d.labelFits) ? d.label : '')
      svgArcLabels.exit().remove()

      // Arcs for parent nodes.
      const arcEnter = d3Shape.arc()
        .innerRadius((n) => n.y)
        .outerRadius((n) => n.y + 1)
        .startAngle((n) => Math.PI * n.angleRange[0] / 180)
        .endAngle((n) => Math.PI * n.angleRange[1] / 180)
      const arc = d3Shape.arc()
        .innerRadius((n) => n.y)
        .outerRadius((n) => n.y + this.params.arcWidth)
        .startAngle((n) => Math.PI * n.angleRange[0] / 180)
        .endAngle((n) => Math.PI * n.angleRange[1] / 180)
      const svgArcs = this.d3.selectAll('.arc').data(this.arcs, (d) => d.data.namePath.join('-'))
      svgArcs.enter().append('path')
        .attr('id', (d) => d.data.namePath.join('-'))
        .attr('class', (d) => 'arc arc-' + d.depth)
        .attr('d', arcEnter)
        .merge(svgArcs).transition().ease(this.config.get('ease')).duration(this.params.duration)
        .style('fill', (d) => this.config.getColor([], this.config.get('levels')[d.depth-1]))
        .attr('d', arc)
      svgArcs.exit().transition().ease(this.config.get('ease')).duration(this.params.duration)
        .attr('d', arcEnter)
        .remove()
    }
    */
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
