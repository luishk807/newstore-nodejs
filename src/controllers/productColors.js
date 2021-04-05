const productColor = require('../services/productColor.service');

module.exports = {
    createProductColor: productColor.createProductColor,
    getProductColorById: productColor.getProductColorById,
    getProductColorByProductId: productColor.getProductColorByProductId,
    getProductColorByIds: productColor.getProductColorByIds,
    getProductColors: productColor.getProductColors
}
