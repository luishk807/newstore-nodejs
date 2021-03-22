const productItemService = require('../services/productItem.service');

module.exports = {
  deleteProductItem: productItemService.deleteProductItem,
  getProductItemByProductId: productItemService.getProductItemByProductId,
  getProductItemById: productItemService.getProductItemById,
  getProductItemByIds: productItemService.getProductItemByIds,
  getProductItems: productItemService.getProductItems
}
