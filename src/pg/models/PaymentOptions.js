const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const PaymentOption = sequelize.define('payment_options', {
  name: {
    type: Sequelize.TEXT
  },
  description: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  default: {
    type: Sequelize.BOOLEAN
  },
  position: {
    type: Sequelize.INTEGER
  },
});

PaymentOption.belongsTo(Statuses, {foreignKey: 'statusId', as: 'paymentOptionStatus'});

module.exports = PaymentOption;