const ProductItem = require('../pg/models/ProductItems');
const ProductColor = require('../pg/models/ProductColors');
const { paginate } = require('../utils');
const includes = ['productItemsStatus','productItemProduct', 'productImages', 'productItemColor', 'productItemSize', 'productItemProductBundles'];
const { Op } = require('sequelize');
const imgStoreSvc = require('../services/imageStorage.service');

const createProductItems = async (items) => {
    const savedFields = [
        'productId',
        'productColorId',
        'productSizeId',
        'stock',
        'model',
        'code',
        'sku',
        'vendorId',
        'unitCost',
        'unitPrice',
        'amount6',
        'amount12',
        'retailPrice',
        'prevRetailPrice',
        'statusId',
        'source'
    ]
    if (Array.isArray(items)) {
        return ProductItem.bulkCreate(items, {
            fields: savedFields, // IMPORTANT
            returning: true
        });
    }
    return []
}

const deleteProductItem = async (id) => {
    const productItem = await ProductItem.findOne({
        where: { id: id },
        include: ['productItemsStatus','productImages', 'productItemColor', 'productItemSize']
    });
    if (productItem) {
        const images = productItem.productImages;
        try {
            const promises = [];
            for (let n = 0; n < images.length; ++n) {
                if (images[n].img_url) {
                    promises.push(imgStoreSvc.remove(images[n].img_url))
                }
                if (images[n].img_thumb_url) {
                    promises.push(imgStoreSvc.remove(images[n].img_thumb_url))
                }
            }
            promises.push(ProductItem.destroy({ where: { id: productItem.id } }));
            await Promise.all(promises);
            return { status: true, message: "Product Item successfully deleted" };
        } catch (e) {
            return { status: false, message: "Product Item delete, but error on deleting image!", error: e.toString() };
        }
    }
    return { status: false, message: 'Product Item not found for deletion', notFound: true };
}

const getProductItemByProductId = async (id) => {
    if (id) {
        const items = ProductItem.findAll({ where: { productId: +id }, include: includes });
        return items;
    }
    return null;
}

const searchProductItemByName = async (search, page = null) => {

    const color = await ProductColor.findOne({ 
        where: {
            [Op.or]: [
                {
                    'name': {
                        [Op.iLike]: `%${search}%`
                    }
                },
                {
                    'color': {
                        [Op.iLike]: `%${search}%`
                    }
                }
            ]
        }
    });
    
    const where = {
        [Op.or]: [
            {
                'sku': {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                'model': {
                    [Op.iLike]: `%${search}%`
                }
            }
        ]
    }

    if (color) {
        where[Op.or].push({
            'productColorId': color.id
        })
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await ProductItem.count({ where });

        const result = await ProductItem.findAll({
            where,
            include: includes,
            offset: offset,
            limit: LIMIT
        });

        const pages = Math.ceil(countResult.count / LIMIT)
        const results = {
            count: countResult,
            items: result,
            pages: pages
        }
        return results;
    } else {
        const product = await ProductItem.findAll({ where, include: includes});
        return product;
    }
}

const getProductItemById = async (id) => {
    if (id) {
        const items = await ProductItem.findOne({ where: { id: id }, include: includes});
        return items;
    }
    return null;
}

const getProductItemsBySkus = async (skus) => {
    if (skus.length > 0) {
        const where = {
            sku: { [Op.in]: skus }
        }
        const items = await ProductItem.findAll({ where: where });
        return items;
    }
    return [];
}

const getProductItemByIds = async (ids, page = null) => {
    const where = {
        id: {
            [Op.in]: ids
        }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await ProductItem.count({ where });

        const result = await ProductItem.findAll({
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
        const product = await ProductItem.findAll({ where, include: includes});
        return product;
    }
}

const getProductItems = async (page = null) => {
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

    const product = await ProductItem.findAndCountAll(query);
    return product;
}


module.exports = {
    createProductItems,
    deleteProductItem,
    getProductItemByProductId,
    getProductItemById,
    getProductItemByIds,
    getProductItems,
    searchProductItemByName,
    getProductItemsBySkus
}
