const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const VendorRate = sequelize.define('vendor_rates', {
  vendor: {
    type: Sequelize.BIGINT,
    field: 'vendorId'
  },
  rate: {
    type: Sequelize.NUMBER
  },
  user: {
    type: Sequelize.BIGINT,
    field: 'userId'
  },
  title: {
    type: Sequelize.TEXT
  },
  comment: {
    type: Sequelize.TEXT
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  }
});

const getVendorRates = () => {
  return VendorRate;
}

module.exports.getModel = getVendorRates;