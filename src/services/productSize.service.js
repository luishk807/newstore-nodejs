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

module.exports = {
    createProductSize
}
