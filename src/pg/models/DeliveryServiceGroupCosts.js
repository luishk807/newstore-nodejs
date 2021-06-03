const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const DeliveryOption = require('./DeliveryOptions');

const DeliveryServiceGroupCost = sequelize.define('delivery_service_group_costs', {
  deliveryOption: {
    type: Sequelize.BIGINT,
    field: 'deliveryOptionId'
  },
  name: {
    type: Sequelize.TEXT,
  },
  amount: {
    type: Sequelize.DECIMAL
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

DeliveryServiceGroupCost.belongsTo(Statuses, {foreignKey: 'statusId', as: 'deliveryServiceGroupCostStatus'});

DeliveryServiceGroupCost.belongsTo(DeliveryOption, {foreignKey: 'deliveryOptionId', as: 'deliveryServiceGroupCostDeliveryOption'});

DeliveryOption.hasMany(DeliveryServiceGroupCost, {as: 'deliveryOptionDeliveryServiceGroupCost'});

module.exports = DeliveryServiceGroupCost;