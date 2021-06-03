const productSize = require('../services/productSize.service');

module.exports = {
    createProductSize: productSize.createProductSize,
    getProductSizeById: productSize.getProductSizeById,
    getProductSizeByProductId: productSize.getProductSizeByProductId,
    getProductSizeByIds: productSize.getProductSizeByIds,
    getProductSizes: productSize.getProductSizes,
}
