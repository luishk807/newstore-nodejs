const ProductSize = require('../pg/models/ProductSizes');

const createProductSize = (value) => {
    if (value) {
        const dataEntry = {
            'name': value.name,
            'productId': value.productId
        }
        return ProductSize.create(dataEntry);
    }
    return null;
}

const getProductSizeByProductId = async (id) => {
    if (id) {
        return ProductSize.findAll({ where: { productId: +id } });
    }
    return null;
}

module.exports = {
    createProductSize,
    getProductSizeByProductId
}
