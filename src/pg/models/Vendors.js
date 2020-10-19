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
  positionId: {
    type: Sequelize.BIGINT
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
  statusId: {
    type: Sequelize.BIGINT
  },
  last_login: {
    type: Sequelize.TIME
  }
});

const getVendor = () => {
  return Vendor;
}

module.exports.getModel = getVendor;