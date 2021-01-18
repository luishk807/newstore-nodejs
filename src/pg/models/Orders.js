const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const OrderStatus = require('./OrderStatuses');

const User = require('./Users');

const OrderProduct = require('./OrderProducts');

const OrderCancelReason = require('./OrderCancelReasons');

const Order = sequelize.define('orders', {
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  subtotal: {
    type: Sequelize.DECIMAL
  },
  order_number: {
    type: Sequelize.TEXT
  },
  grandtotal: {
    type: Sequelize.DECIMAL
  },
  tax: {
    type: Sequelize.DECIMAL
  },
  orderStatus: {
    type: Sequelize.BIGINT,
    field: 'orderStatusId'
  },
  orderCancelReason: {
    type: Sequelize.BIGINT,
    field: 'orderCancelReasonId'
  },
  shipping_name: {
    type: Sequelize.TEXT
  },
  shipping_address: {
    type: Sequelize.TEXT
  },
  shipping_city: {
    type: Sequelize.TEXT
  },
  shipping_country: {
    type: Sequelize.TEXT
  },
  shipping_province: {
    type: Sequelize.TEXT
  },
  shipping_township: {
    type: Sequelize.TEXT
  },
  shipping_corregimiento: {
    type: Sequelize.TEXT
  },
  shipping_zip: {
    type: Sequelize.TEXT
  },
  shipping_email: {
    type: Sequelize.TEXT
  },
  shipping_district: {
    type: Sequelize.TEXT
  }
});

Order.belongsTo(OrderCancelReason, { foreignKey: 'orderCancelReasonId', as: "orderCancelReasons"})

Order.belongsTo(OrderStatus, { foreignKey: 'orderStatusId', as: "orderStatuses"})

Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' })

Order.hasMany(OrderProduct, { as: 'orderOrderProduct'})

module.exports = Order;