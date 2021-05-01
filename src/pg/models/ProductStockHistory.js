const sequelize = require('../sequelize');
const Sequelize = require('sequelize');

const ProductStockHistory = sequelize.define('product_stock_history', {
    id: { type: Sequelize.BIGINT, primaryKey: true },
    product_id: { type: Sequelize.BIGINT },
    product_item_id: { type: Sequelize.BIGINT },
    orders_id: { type: Sequelize.BIGINT },
    order_products_id: { type: Sequelize.BIGINT },
    createdAt: { type: Sequelize.DATE, field: 'created_at' },
    quantity: { type: Sequelize.INTEGER },
}, {
    schema: 'public',
    freezeTableName: true,
    timestamps: false
});

module.exports = ProductStockHistory;
