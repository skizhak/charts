const ContrailUtils = {
  getConfigModelName (viewName) {
    return viewName.replace('View', 'ConfigModel')
  }
}
module.exports = ContrailUtils
