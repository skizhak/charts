// Copyright (c) Juniper Networks, Inc. All rights reserved.

import './tooltip.scss'
import ContrailChartsView from 'contrail-charts-view'
import TitleView from 'plugins/title/TitleView'
import _template from './tooltip.html'

export default class TooltipView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.resetParams()
    this.config.container = p.container
    this.listenTo(this.config, 'change', this.resetParams)
  }
  /**
   * @param {Object} position relative to container: top, left in pixels
   * @param {Object} data to display
   */
  show (position, data) {
    let left, top
    this._loadTemplate(data)
    this.d3.classed('active', true)

    const width = this.el.offsetWidth
    const height = this.el.offsetHeight
    const containerWidth = this._container.offsetWidth

    if (this.config.get('sticky')) {
      // TODO do not make assumptions on source component internal structure, just get it by ID only
      // and get margin from its config model
      const sourceRect = this._container.querySelector('#' + this.config.sourceId + ' clipPath rect').getBoundingClientRect()
      const containerRect = this._container.getBoundingClientRect()
      left = sourceRect.left - containerRect.left
      if (position.left > containerRect.width / 2) {
        left += this.config.stickyMargin.left
      } else {
        left += (sourceRect.width - this.config.stickyMargin.right - width)
      }
      top = sourceRect.top - containerRect.top + (sourceRect.height / 2 - height / 2)
      position = {left, top}
    } else {
      left = position.left - width / 2
      top = position.top - height - 10

      if (top < 0) top = position.top + 10
      if (left + width > containerWidth) {
        left = containerWidth - width
      } else if (left < 0) left = 0
    }

    this.el.style.top = `${top}px`
    this.el.style.left = `${left}px`
    this.el.style.height = `${position.height}px`
  }

  hide () {
    this.d3.classed('active', false)
  }

  _loadTemplate (data) {
    const template = this.config.get('template') || _template
    const tooltipContent = this.config.getFormattedData(data)
    super.render(template(tooltipContent))
    // TODO Discuss if title needs to be handled via TitleView or using the tooltip template itself.
    if (tooltipContent.title) {
      TitleView(this.d3.select('.tooltip-content').node(), tooltipContent.title)
    }
  }
}
