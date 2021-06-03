const ProductUnified = require('../pg/models/ProductUnified');
const { Op } = require('sequelize');
const { paginate } = require('../utils');
const config = require('../config');
const LIMIT = config.defaultLimit;

const searchProductUnified = async (search,  { limit = LIMIT, page = null }) => {
    const where = {
        [Op.or]: [
            {
                'name': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'description': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'sku': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'productModel': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'code': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'productColorName': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'productSizeName': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'productItemModel': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'productItemCode': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'productItemSku': {
                    [Op.iLike]: `%${search}%`
                }
            }
        ]
    }

    if (page) {
        const offset = paginate(page, limit);

        const count = await ProductUnified.count({ where });

        const result = await ProductUnified.findAll({
            where,
            offset: offset,
            limit: limit
        });

        const pages = Math.ceil(count / limit);
        const results = {
            count: count,
            items: result,
            pages: pages,
            currentPage: page
        }
        return results;
    } else {
        const product = await ProductUnified.findAll({ where });
        return {
            items: product
        }
    }
}

module.exports = {
    searchProductUnified
}