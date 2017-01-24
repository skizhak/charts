const ContrailChartsView = require('contrail-charts-view')
const _template = require('./legend.html')

class LegendPanelView extends ContrailChartsView {
  get type () { return 'legendPanel' }
  get className () { return 'legend-panel' }
  get events () {
    return {
      'change .legend-attribute': '_onItemClick',
      'click .edit': '_toggleEditMode',
    }
  }

  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)

    super.render(content)
  }

  _onItemClick (d, el) {
    const accessorName = el.getAttribute('data-value')
    const isChecked = el.querySelector('input').checked
    this._actionman.fire('SelectSerie', accessorName, isChecked)
  }

  _toggleEditMode (d, el) {
    // TODO: change button text
    this.$el.find('.legend-attribute').toggleClass('edit')
  }
}

module.exports = LegendPanelView
