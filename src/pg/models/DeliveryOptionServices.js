const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const DeliveryService = require('./DeliveryServices');

const DeliveryOption = require('./DeliveryOptions');

const DeliveryOptionService = sequelize.define('delivery_option_services', {
  deliveryOption: {
    type: Sequelize.BIGINT,
    field: 'deliveryOptionId'
  },
  deliveryService: {
    type: Sequelize.BIGINT,
    field: 'deliveryServiceId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  position: {
    type: Sequelize.INTEGER
  },
  default: {
    type: Sequelize.BOOLEAN
  }
});

DeliveryOptionService.belongsTo(Statuses, {foreignKey: 'statusId', as: 'deliveryOptionServiceStatus'});

DeliveryOption.hasMany(DeliveryOptionService, {foreignKey: 'deliveryOption', as: 'deliveryOptionDeliveryServiceOptions'});

DeliveryOptionService.belongsTo(DeliveryService, {foreignKey: 'deliveryServiceId', as: 'deliveryOptionServiceDeliveryService'});

DeliveryOptionService.belongsTo(DeliveryOption, {foreignKey: 'deliveryOptionId', as: 'deliveryOptionServiceDeliveryOption'});

module.exports = DeliveryOptionService;