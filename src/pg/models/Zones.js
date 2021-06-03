const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Statuses = require('./Statuses');

const Province = require('./Provinces');

const District = require('./Districts');

const Corregimiento = require('./Corregimientos');

const Zone = sequelize.define('zones', {
  name: {
    type: Sequelize.TEXT
  },
  province: {
    type: Sequelize.BIGINT,
    field: 'provinceId'
  },
  district: {
    type: Sequelize.BIGINT,
    field: 'districtId'
  },
  corregimiento: {
    type: Sequelize.BIGINT,
    field: 'corregimientoId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

Zone.belongsTo(Statuses, {foreignKey: 'statusId', as: 'zoneStatus'});

Zone.belongsTo(Province, {foreignKey: 'provinceId', as: 'zoneProvince'});
Zone.belongsTo(District, {foreignKey: 'districtId', as: 'zoneDistrict'});
Zone.belongsTo(Corregimiento, {foreignKey: 'corregimientoId', as: 'zoneCorregimiento'});


module.exports = Zone;