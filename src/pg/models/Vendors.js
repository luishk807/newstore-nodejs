const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const VendorRate = require('./VendorRates');

const Product = require('./Products');

const User = require('./Users');

const Country = require('./Countries');

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
    type: Sequelize.BIGINT,
    field: 'stateId',
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
Vendor.belongsTo(Country, {foreignKey: 'countryId', as: "vendorCountry"});
Vendor.belongsTo(User, {foreignKey: 'userId', as: "vendorUser"});
Product.belongsTo(Vendor, {foreignKey: 'vendorId', as: 'productVendor'});

module.exports = Vendor;