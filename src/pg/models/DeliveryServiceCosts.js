const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const DeliveryService = require('./DeliveryServices');

const Province = require('./Provinces');

const District = require('./Districts');

const Corregimiento = require('./Corregimientos');

const Zone = require('./Zones');

const Country = require('./Countries');

const DeliveryServiceCost = sequelize.define('delivery_service_costs', {
  deliveryService: {
    type: Sequelize.BIGINT,
    field: 'deliveryServiceId'
  },
  province: {
    type: Sequelize.BIGINT,
    field: 'provinceId'
  },
  country: {
    type: Sequelize.BIGINT,
    field: 'countryId'
  },
  district: {
    type: Sequelize.BIGINT,
    field: 'districtId'
  },
  corregimiento: {
    type: Sequelize.BIGINT,
    field: 'corregimientoId'
  },
  amount: {
    type: Sequelize.DECIMAL
  },
  zone: {
    type: Sequelize.BIGINT,
    field: 'zoneId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

DeliveryServiceCost.belongsTo(Statuses, {foreignKey: 'statusId', as: 'deliveryServiceCostStatus'});

DeliveryServiceCost.belongsTo(DeliveryService, {foreignKey: 'deliveryServiceId', as: 'deliveryServiceCostDeliveryService'});
DeliveryServiceCost.belongsTo(Country, { foreignKey: 'countryId', as: 'deliveryServiceCostCountry'});
DeliveryServiceCost.belongsTo(Province, {foreignKey: 'provinceId', as: 'deliveryServiceCostProvince'});
DeliveryServiceCost.belongsTo(District, {foreignKey: 'districtId', as: 'deliveryServiceCostDistrict'});
DeliveryServiceCost.belongsTo(Zone, {foreignKey: 'zoneId', as: 'deliveryServiceCostZone'});
DeliveryServiceCost.belongsTo(Corregimiento, {foreignKey: 'corregimientoId', as: 'deliveryServiceCostCorregimiento'});

module.exports = DeliveryServiceCost;