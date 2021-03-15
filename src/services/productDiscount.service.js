const ProductDiscount = require('../pg/models/ProductDiscounts');

const createProductDiscount = async (value) => {
    let startDate = null;
    let endDate = null;
    const nUseDate = value.useDate === 'true' ? true : false;

    if (nUseDate) {
        console.log("dont use dates");
        startDate = (value.startDate) ? value.startDate : null;
        endDate = (value.endDate) ? (value.endDate) : new Date(9999, 11, 31);
    } else {

    }

    return ProductDiscount.create({
        'productId': +value.productId,
        'name': value.name,
        'useDate': nUseDate,
        'startDate': startDate,
        'endDate': endDate,
        'minQuantity': +value.minQuantity,
        'percentage': +value.percentage,
    });
}

const updateProductDiscount = async (value) => {
    const body = value.body;
    const id = value.params.id;

    let startDate = null;
    let endDate = null;
    const nUseDate = body.useDate === 'true' ? true : false;

    if (nUseDate) {
        startDate = (body.startDate) ? body.startDate : null;
        endDate = (body.endDate) ? (body.endDate) : new Date(9999, 11, 31);
    }

    return ProductDiscount.update({
        'name': body.name,
        'useDate': nUseDate,
        'startDate': startDate,
        'endDate': endDate,
        'minQuantity': +body.minQuantity,
        'percentage': +body.percentage,
    },
    {
        where: {
            id: id
        }
    });
}

module.exports = {
    createProductDiscount,
    updateProductDiscount
}
