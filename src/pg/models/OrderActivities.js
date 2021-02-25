const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const OrderStatus = require('./OrderStatuses');

const User = require('./Users');

const OrderActivity = sequelize.define('order_activities', {
  name: {
    type: Sequelize.TEXT
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  order: {
    type: Sequelize.BIGINT,
    field: 'orderId'
  },
  orderStatus: {
    type: Sequelize.BIGINT,
    field: 'orderStatusId'
  },
});

OrderActivity.belongsTo(OrderStatus, { foreignKey: 'orderStatusId', as: "orderActivityStatuses"})

OrderActivity.belongsTo(User, { foreignKey: 'userId', as: 'orderActivityUser' })


module.exports = OrderActivity;