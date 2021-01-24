const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const OrderCancelReason = sequelize.define('order_cancel_reasons', {
  name: {
    type: Sequelize.TEXT
  },
});

module.exports = OrderCancelReason;