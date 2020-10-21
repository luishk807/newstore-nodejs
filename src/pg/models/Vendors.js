const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const VendorRateModel = require('./VendorRates');
const VendorRate = VendorRateModel.getModel();

const ProductModel = require('./Products');
const Product = ProductModel.getModel();

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

Vendor.hasMany(VendorRate, { as: "vendor_rates" });
Vendor.hasMany(Product, { as: "products" });
Product.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: 'vendors',
  onDelete: 'SET NULL'
})

const getVendor = () => {
  return Vendor;
}

module.exports.getModel = getVendor;