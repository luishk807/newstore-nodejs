const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Status = require('./Statuses');

const User = require('./Users');

const OrderProduct = require('./OrderProducts');

const Order = sequelize.define('orders', {
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  subtotal: {
    type: Sequelize.decimal
  },
  grandtotal: {
    type: Sequelize.decimal
  },
  tax: {
    type: Sequelize.decimal
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

Order.belongsTo(Status, { foreignKey: 'statusId', as: "orderStatus"})

Order.belongsTo(User, { foreignKey: 'userId', as: 'orderUser' })

Order.hasMany(OrderProduct, { as: 'orderOrderProduct'})

module.exports = Order;