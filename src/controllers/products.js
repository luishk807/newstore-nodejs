const productService = require('../services/product.service');

module.exports = {
    importProducts: productService.importProducts,
    deleteProduct: productService.deleteProduct,
    searchProductByName: productService.searchProductByName,
    searchProductByType: productService.searchProductByType,
    searchProductByIds: productService.searchProductByIds,
    searchProductById: productService.searchProductById,
    searchProductByIdFullDetail: productService.searchProductByIdFullDetail,
    searchProductBySlug: productService.searchProductBySlug,
    searchProductBySlugs: productService.searchProductBySlugs,
    getAllProducts: productService.getAllProducts,
    createManualProduct: productService.createManualProduct,
    updateProduct: productService.updateProduct
}
