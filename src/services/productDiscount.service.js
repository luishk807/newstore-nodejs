const ProductDiscount = require('../pg/models/ProductDiscounts');
const { Op } = require('sequelize');
const { paginate } = require('../utils');
const includes = ['productDiscountProduct'];

const createProductDiscount = async (value) => {
    let startDate = null;
    let endDate = null;
    const nUseDate = value.useDate === 'true' ? true : false;

    if (nUseDate) {
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

const getProductDiscountById = async (id) => {
    if (id) {
        const colors = await ProductDiscount.findOne({ where: { id: id }, include: includes});
        return colors;
    }
    return null;
}

const getProductDiscountByProductId = async (id) => {
    if (id) {
        const colors = await ProductDiscount.findAll({ where: { productId: +id }, include: includes });
        return colors;
    }
    return null;
}

const getProductDiscountByIds = async (ids, page = null) => {
    const where = {
        id: {
            [Op.in]: ids
        }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await ProductDiscount.findAndCountAll({ where });

        const result = await ProductDiscount.findAll({
            where,
            include: includes,
            offset: offset,
            limit: LIMIT
        });

        const pages = Math.ceil(countResult.count / LIMIT)
        const results = {
            count: countResult.count,
            items: result,
            pages: pages
        }
        return results;
    } else {
        const product = await ProductDiscount.findAll({ where, include: includes});
        return product;
    }
}

const getProductDiscounts = async (page = null) => {
    let query = {
        include: includes
    }
    
    if (page) {
        query = {
            ...query,
            limit: LIMIT,
            distinct: true,
            offset: paginate(page),
        }
    }

    const product = await ProductDiscount.findAndCountAll(query);
    return product;
}

module.exports = {
    createProductDiscount,
    updateProductDiscount,
    getProductDiscountById,
    getProductDiscountByProductId,
    getProductDiscountByIds,
    getProductDiscounts
}
