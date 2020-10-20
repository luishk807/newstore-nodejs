const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

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

const getVendor = () => {
  return Vendor;
}

module.exports.getModel = getVendor;