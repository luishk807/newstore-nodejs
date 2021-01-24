const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const OrderStatus = sequelize.define('order_statuses', {
  name: {
    type: Sequelize.TEXT
  },
});

module.exports = OrderStatus;