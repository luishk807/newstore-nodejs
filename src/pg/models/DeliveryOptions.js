const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const DeliveryOption = sequelize.define('delivery_options', {
  name: {
    type: Sequelize.TEXT
  },
  description: {
    type: Sequelize.TEXT
  },
  total: {
    type: Sequelize.DECIMAL
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

DeliveryOption.belongsTo(Statuses, {foreignKey: 'statusId', as: 'deliveryOptionStatus'});

module.exports = DeliveryOption;