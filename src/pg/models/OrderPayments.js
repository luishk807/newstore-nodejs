const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const PaymentOption = require('./PaymentOptions');

const OrderPayment = sequelize.define('order_payments', {
  name: {
    type: Sequelize.TEXT
  },
  paymentOption: {
    type: Sequelize.BIGINT,
    field: 'paymentOptionId'
  },
  grandTotal: {
    type: Sequelize.DECIMAL
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  orderId: {
    type: Sequelize.BIGINT
  },
});

OrderPayment.belongsTo(Statuses, { foreignKey: 'statusId', as: 'orderPaymentStatus'});

OrderPayment.belongsTo(PaymentOption, { foreignKey: 'paymentOptionId', as: 'orderPaymentPaymentOption'});

module.exports = OrderPayment;