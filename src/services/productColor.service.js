const ProductColor = require('../pg/models/ProductColors');
const includes = ['colorStatus'];
const { paginate } = require('../utils');
const { Op } = require('sequelize');

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
        const colors = await ProductColor.findOne({ where: { id: id }, include: includes});
        return colors;
    }
    return null;
}

const getProductColorByProductId = async (id) => {
    if (id) {
        const colors = await ProductColor.findAll({ where: { productId: +id }, include: includes });
        return colors;
    }
    return null;
}

const getProductColorByIds = async (ids, page = null) => {
    const where = {
        id: {
            [Op.in]: ids
        }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await ProductColor.count({ where });

        const result = await ProductColor.findAll({
            where,
            include: includes,
            offset: offset,
            limit: LIMIT
        });

        const pages = Math.ceil(countResult / LIMIT)
        const results = {
            count: countResult,
            items: result,
            pages: pages
        }
        return results;
    } else {
        const product = await ProductColor.findAll({ where, include: includes});
        return product;
    }
}

const getProductColors = async (page = null) => {
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

    const product = await ProductColor.findAndCountAll(query);
    return product;
}

module.exports = {
    createProductColor,
    getProductColorById,
    getProductColorByProductId,
    getProductColorByIds,
    getProductColors
}
