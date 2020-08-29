const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const Brand = sequelize.define('brand', {
  name: {
    type: Sequelize.TEXT
  }
});

const getBrand = () => {
  return Brand;
}

module.exports.getBrandModel = getBrand;