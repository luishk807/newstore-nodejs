const service = require('../../services/inventarioz/product.service');
const stockService = require('../../services/inventarioz/stock.service');

const saveProduct = async (value) => {
    const result = await service.saveProduct(value);
    if (!result.error) {
        let product_id = -1;
        let product_variant_id = -1;
        if (result.product_id && result.id) { // It is a product variant result
            product_id = result.product_id;
            product_variant_id = result.id;
        } else if (!result.product_id && result.product_variant && result.product_variant.length) {
            product_id = result.id;
            product_variant_id = result.product_variant[0].id;
        }
        // Creates initial stock registry
        // const stockResult = await stockService.createStock({
        //     product_id: product_id,
        //     product_variant_id: product_variant_id
        // });
        // if (stockResult.error) {
        //     console.error('Error creating stock for product_id: ' + product_id, stockResult);
        // }
    }
    return result;
}

module.exports = {
    getOptions: service.getOptions,
    saveOptions: service.saveOptions,
    saveOptionsValue: service.saveOptionsValue,
    deleteOption: service.deleteOption,
    saveProduct: saveProduct,
    searchProduct: service.searchProduct,
    getProduct: service.getProduct,
    deleteProductVariant: service.deleteProductVariant,
    getStock: stockService.getStock
}
