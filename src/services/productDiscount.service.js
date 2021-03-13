const ProductDiscount = require('../pg/models/ProductDiscounts');

const createProductDiscount = async (value) => {
    return ProductDiscount.create({
        'productId': +value.productId,
        'price': +value.price,
        'name': value.name,
        'startDate': (value.startDate) ? value.startDate : null,
        'endDate': (value.endDate) ? (value.endDate) : new Date(9999, 11, 31),
        'minQuantity': +value.minQuantity,
        'percentage': +value.percentage,
    });
}

module.exports = {
    createProductDiscount
}
