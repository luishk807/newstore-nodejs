const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Brand = sequelize.define('brand', {
  name: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT
  }
});

const getBrand = () => {
  return Brand;
}

module.exports.getModel = getBrand;