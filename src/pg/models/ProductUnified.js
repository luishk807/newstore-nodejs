const Sequelize = require('sequelize');
const pgconfig = require('../config')
const sequelize = pgconfig.getSequelize();

const ProductUnified = sequelize.define('products_unified', {
    productId: {
        type: Sequelize.BIGINT
    },
    name: {
        type: Sequelize.TEXT
    },
    description: {
        type: Sequelize.TEXT
    },
    productModel: {
        type: Sequelize.TEXT
    },
    code: {
        type: Sequelize.TEXT
    },
    categoryId: {
        type: Sequelize.BIGINT
    },
    brandId: {
        type: Sequelize.BIGINT
    },
    stock: {
        type: Sequelize.BIGINT
    },
    statusId: {
        type: Sequelize.BIGINT
    },
    amount: {
        type: Sequelize.DECIMAL
    },
    sku: {
        type: Sequelize.TEXT
    },
    subCategoryId: {
        type: Sequelize.BIGINT
    },
    categoryName: {
        type: Sequelize.TEXT
    },
    brandName: {
        type: Sequelize.TEXT
    },
    productItemId: {
        type: Sequelize.BIGINT 
    },
    productColorId: {
        type: Sequelize.BIGINT
    },
    productSizeId: {
        type: Sequelize.BIGINT
    },
    productItemStock: {
        type: Sequelize.BIGINT
    },
    productItemUpdatedAt: {
        type: Sequelize.DATE
    },
    productItemStatusId: {
        type: Sequelize.BIGINT
    },
    productItemModel: {
        type: Sequelize.TEXT
    },
    productItemCode: {
        type: Sequelize.TEXT
    },
    unitCost: {
        type: Sequelize.DECIMAL
    },
    unitPrice: {
        type: Sequelize.DECIMAL
    },
    exp_date: {
        type: Sequelize.DATE
    },
    retailPrice: {
        type: Sequelize.DECIMAL
    },
    productItemSku: {
        type: Sequelize.TEXT
    },
    productItemQuantity: {
        type: Sequelize.BIGINT
    },
    quantityLabel: {
        type: Sequelize.TEXT
    },
    productColorName: {
        type: Sequelize.TEXT
    },
    productSizeName: {
        type: Sequelize.TEXT
    }
},
{
    schema: 'public',
    freezeTableName: true,
    timestamps: false
});

ProductUnified.removeAttribute('id');

module.exports = ProductUnified;
