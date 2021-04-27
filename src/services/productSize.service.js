const ProductSize = require('../pg/models/ProductSizes');
const includes = ['sizeStatus'];
const { paginate } = require('../utils');
const { Op } = require('sequelize');

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
        const sizes = ProductSize.findAll({ where: { productId: +id }, include: includes });
        return sizes;
    }
    return null;
}


const getProductSizeById = async (id) => {
    if (id) {
        const sizes = await ProductSize.findOne({ where: { id: id }, include: includes});
        return sizes;
    }
    return null;
}


const getProductSizeByIds = async (ids, page = null) => {
    const where = {
        id: {
            [Op.in]: ids
        }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await ProductSize.count({ where });

        const result = await ProductSize.findAll({
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
        const product = await ProductSize.findAll({ where, include: includes});
        return product;
    }
}

const getProductSizes = async (page = null) => {
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

    const product = await ProductSize.findAndCountAll(query);
    return product;
}

module.exports = {
    createProductSize,
    getProductSizeByProductId,
    getProductSizeById,
    getProductSizeByIds,
    getProductSizes
}
