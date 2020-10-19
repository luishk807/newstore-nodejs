const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Store = sequelize.define('store', {
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
  countryId: {
    type: Sequelize.BIGINT
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
  statusId: {
    type: Sequelize.BIGINT
  },
});

const getStore = () => {
  return Store;
}

module.exports.getModel = getStore;