const productDiscount = require('../services/productDiscount.service');

module.exports = {
    createProductDiscount: productDiscount.createProductDiscount,
    updateProductDiscount: productDiscount.updateProductDiscount,
    getProductDiscountById: productDiscount.getProductDiscountById,
    getProductDiscountByProductId: productDiscount.getProductDiscountByProductId,
    getProductDiscountByIds: productDiscount.getProductDiscountByIds,
    getProductDiscounts: productDiscount.getProductDiscounts,

}
