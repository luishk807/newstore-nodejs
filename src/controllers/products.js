const productService = require('../services/product.service');

module.exports = {
    importProducts: productService.importProducts,
    deleteProduct: productService.deleteProduct,
    searchProductByName: productService.searchProductByName,
    searchProductByType: productService.searchProductByType,
    searchProductByIds: productService.searchProductByIds,
    searchProductById: productService.searchProductById,
    getAllProducts: productService.getAllProducts,
}
