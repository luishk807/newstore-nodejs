const productBundle = require('../services/productBundle.service');

module.exports = {
    createProductBundle: productBundle.createProductBundle,
    deleteProductBundleById: productBundle.deleteProductBundleById,
    saveProductBundle: productBundle.saveProductBundle,
    getProductBundleByProductItemId: productBundle.getProductBundleByProductItemId,
    getActiveProductBundleByProductItemId: productBundle.getActiveProductBundleByProductItemId,
    getProductBundleById: productBundle.getProductBundleById,
    geAllProductBundles: productBundle.geAllProductBundles,
    getProductBundleByIds: productBundle.getProductBundleByIds
}