const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const VendorRate = require('./VendorRates');

const Product = require('./Products');

const Vendor = sequelize.define('vendor', {
  first_name: {
    type: Sequelize.TEXT
  },
  last_name: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT,
    field: 'positionId'
  },
  description: {
    type: Sequelize.TEXT
  },
  password: {
    type: Sequelize.TEXT
  },
  email: {
    type: Sequelize.TEXT
  },
  img: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
  last_login: {
    type: Sequelize.TIME
  }
});

Vendor.hasMany(VendorRate);
Vendor.hasMany(Product);
Product.belongsTo(Vendor, {foreignKey: 'vendor', as: 'productVendor'})

module.exports = Vendor;