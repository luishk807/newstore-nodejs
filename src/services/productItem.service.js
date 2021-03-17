const ProductItem = require('../pg/models/ProductItems');
const s3 = require('./storage.service');
const config = require('../config');
const { paginate } = require('../utils');
const includes = ['productItemsStatus','productItemProduct', 'productImages', 'productItemColor', 'productItemSize'];
const { Op } = require('sequelize');

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
        const mapFiles = productItem.productItemImages.map(data => data.img_url);
        try {
            mapFiles.forEach(data => {
                s3.deleteObject({ Bucket: config.s3.bucketName, Key: data }, (err, data) => {
                    if (err) {
                        // res.status(500).send({status: false, message: err})
                    }
                })
            })
            await ProductItem.destroy({ where: { id: productItem.id } });
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


const getProductItemById = async (id) => {
    if (id) {
        const items = await ProductItem.findOne({ where: { id: id }, include: includes});
        return items;
    }
    return null;
}


const getProductItemByIds = async (ids, page = null) => {
    const where = {
        id: {
            [Op.in]: ids
        }
    }

    if (page) {
        const offset = paginate(page);

        const countResult = await ProductItem.findAndCountAll({ where });

        const result = await ProductItem.findAll({
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
    getProductItems
}
