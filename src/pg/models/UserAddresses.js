const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();
const User = require('./Users');
const Country = require('./Countries');
const Province = require('./Provinces');
const District = require('./Districts');
const Zone = require('./Zones');
const Corregimiento = require('./Corregimientos');
const UserAddress = sequelize.define('user_addresses', {
  name: {
    type: Sequelize.TEXT
  },
  address: {
    type: Sequelize.TEXT
  },
  addressB: {
    type: Sequelize.TEXT
  },
  note: {
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
  zone: {
    type: Sequelize.BIGINT,
    field: 'zoneId'
  },
  corregimiento: {
    type: Sequelize.BIGINT,
    field: 'corregimientoId'
  },
  township: {
    type: Sequelize.TEXT
  },
  city: {
    type: Sequelize.TEXT
  },
  country: {
    type: Sequelize.BIGINT,
    field: 'countryId'
  },
  state: {
    type: Sequelize.BIGINT
  },
  zip: {
    type: Sequelize.TEXT
  },
  phone: {
    type: Sequelize.TEXT
  },
  mobile: {
    type: Sequelize.TEXT
  },
  email: {
    type: Sequelize.TEXT
  },
  note: {
    type: Sequelize.TEXT
  },
  selected: {
    type: Sequelize.BOOLEAN
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
});

UserAddress.belongsTo(User, { foreignKey: 'userId', as: 'addressesUsers'})

UserAddress.belongsTo(Country, { foreignKey: 'countryId', as: 'addressCountry'});

UserAddress.belongsTo(District, { foreignKey: 'districtId', as: 'addressDistrict'});

UserAddress.belongsTo(Zone, { foreignKey: 'zoneId', as: 'addressZone'});

UserAddress.belongsTo(Province, { foreignKey: 'provinceId', as: 'addressProvince'});

UserAddress.belongsTo(Corregimiento, { foreignKey: 'corregimientoId', as: 'addressCorregimiento'});

User.hasMany(UserAddress, { foreignKey: 'userId', as: 'userAddresses' })

module.exports = UserAddress;