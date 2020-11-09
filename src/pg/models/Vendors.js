const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const VendorRate = require('./VendorRates');

const Product = require('./Products');

const User = require('./Users');

const Vendor = sequelize.define('vendor', {
  name: {
    type: Sequelize.TEXT
  },
  position: {
    type: Sequelize.BIGINT,
    field: 'positionId'
  },
  description: {
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
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  }
});

Vendor.hasMany(VendorRate);
Vendor.hasMany(Product);
Vendor.belongsTo(User, {foreignKey: 'userId', as: "vendorUser"})
Product.belongsTo(Vendor, {foreignKey: 'vendorId', as: 'productVendor'})

module.exports = Vendor;