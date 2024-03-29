const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Store = sequelize.define('stores', {
  name: {
    type: Sequelize.TEXT
  },
  email: {
    type: Sequelize.TEXT
  },
  address: {
    type: Sequelize.TEXT
  },
  province: {
    type: Sequelize.TEXT
  },
  city: {
    type: Sequelize.TEXT
  },
  township: {
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
    type: Sequelize.TIME
  },
  phone: {
    type: Sequelize.TIME
  },
  mobile: {
    type: Sequelize.TIME
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

module.exports = Store;