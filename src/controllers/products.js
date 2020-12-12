const productService = require('../services/product.service');

module.exports = {
    importProducts: productService.importProducts,
    deleteProduct: productService.deleteProduct
}
