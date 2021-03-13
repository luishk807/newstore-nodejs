const ProductColor = require('../pg/models/ProductColors');
const includes = ['colorStatus'];

const createProductColor = async (value) => {
    if (value) {
        const dataEntry = {
            'color': value.color,
            'name': value.name,
            'productId': value.productId
        }

        const result = await ProductColor.create(dataEntry);
        return result;
    }
    return null;
}

const getProductColorById = async (id) => {
    if (id) {
        return ProductColor.findOne({ where: { id: id }, include: includes});
    }
    return null;
}

const getProductColorByProductId = async (id) => {
    if (id) {
        return ProductColor.findAll({ where: { productId: +id } });
    }
    return null;
}

module.exports = {
    createProductColor,
    getProductColorById,
    getProductColorByProductId
}
