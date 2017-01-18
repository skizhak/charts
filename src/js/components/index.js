const ControlPanelConfigModel = require('components/control-panel/ControlPanelConfigModel')
const ControlPanelView = require('components/control-panel/ControlPanelView')
const MessageConfigModel = require('components/message/MessageConfigModel')
const MessageView = require('components/message/MessageView')
const NavigationConfigModel = require('components/navigation/NavigationConfigModel')
const NavigationView = require('components/navigation/NavigationView')
const TimelineConfigModel = require('components/timeline/TimelineConfigModel')
const TimelineView = require('components/timeline/TimelineView')
const TooltipConfigModel = require('components/tooltip/TooltipConfigModel')
const TooltipView = require('components/tooltip/TooltipView')
const LegendConfigModel = require('components/legend/LegendConfigModel')
const LegendView = require('components/legend/LegendView')
const LegendUniversalConfigModel = require('components/legend-universal/LegendConfigModel')
const LegendUniversalView = require('components/legend-universal/LegendView')
const CrosshairConfigModel = require('components/crosshair/CrosshairConfigModel')
const CrosshairView = require('components/crosshair/CrosshairView')
const ColorPickerConfigModel = require('components/color-picker/ColorPickerConfigModel')
const ColorPickerView = require('components/color-picker/ColorPickerView')
const CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')
const CompositeYChartView = require('components/composite-y/CompositeYChartView')
const PieChartConfigModel = require('components/radial/PieChartConfigModel')
const PieChartView = require('components/radial/PieChartView')
const StandaloneConfigModel = require('components/standalone/StandaloneConfigModel')
const StandaloneView = require('components/standalone/StandaloneView')

module.exports = {
  tooltip: {
    ConfigModel: TooltipConfigModel,
    View: TooltipView
  },
  legend: {
    ConfigModel: LegendConfigModel,
    View: LegendView
  },
  legendUniversal: {
    ConfigModel: LegendUniversalConfigModel,
    View: LegendUniversalView,
  },
  crosshair: {
    ConfigModel: CrosshairConfigModel,
    View: CrosshairView
  },
  colorPicker: {
    ConfigModel: ColorPickerConfigModel,
    View: ColorPickerView
  },
  navigation: {
    ConfigModel: NavigationConfigModel,
    View: NavigationView
  },
  timeline: {
    ConfigModel: TimelineConfigModel,
    View: TimelineView
  },
  message: {
    ConfigModel: MessageConfigModel,
    View: MessageView
  },
  controlPanel: {
    ConfigModel: ControlPanelConfigModel,
    View: ControlPanelView
  },
  compositeY: {
    ConfigModel: CompositeYChartConfigModel,
    View: CompositeYChartView
  },
  pieChart: {
    ConfigModel: PieChartConfigModel,
    View: PieChartView
  }
}
