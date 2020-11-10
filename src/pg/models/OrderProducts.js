const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');

const Product = require('./Products');

const Order = require('./Orders');

const OrderProduct = sequelize.define('order_products', {
  product: {
    type: Sequelize.BIGINT,
    field: 'productId'
  },
  quantity: {
    type: Sequelize.NUMBER
  },
  total: {
    type: Sequelize.decimal
  },
  order: {
    type: Sequelize.BIGINT,
    field: 'orderId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

Order.belongsTo(Status, { foreignKey: 'status', as: "orderStatus"})

OrderProduct.belongsTo(Order, { foreignKey: 'orderId', as: "orderProductOrder"})

Order.belongsTo(Product, { foreignKey: 'productId', as: 'orderProduct' })

module.exports = OrderProduct;