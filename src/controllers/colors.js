const color = require('../services/color.service');

module.exports = {
  deleteColorById: color.deleteColorById,
  trashedColorById: color.trashedColorById,
  updateColor: color.updateColor,
  createColor: color.createColor,
  getColorByProductId: color.getColorByProductId,
  getColorById: color.getColorById,
  getColorByIds: color.getColorByIds,
  getAllColor: color.getAllColor,
  getAllActiveColor: color.getAllActiveColor,
  getAllActiveColorsWithFilters: color.getAllActiveColorsWithFilters,
  getActiveColorByProductId: color.getActiveColorByProductId
}
