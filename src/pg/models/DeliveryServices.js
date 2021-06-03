const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const DeliveryService = sequelize.define('delivery_services', {
  name: {
    type: Sequelize.TEXT
  },
  description: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

DeliveryService.belongsTo(Statuses, {foreignKey: 'statusId', as: 'deliveryServiceStatus'});

module.exports = DeliveryService;