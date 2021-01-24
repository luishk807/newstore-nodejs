const Sequelize = require('sequelize');
const pgconfig = require('../config')

const sequelize = pgconfig.getSequelize();

const District = sequelize.define('districts', {
  name: {
    type: Sequelize.TEXT
  },
  province: {
    type: Sequelize.BIGINT,
    field: 'provinceId'
  },
  status: {
    type: Sequelize.BIGINT,
    field: 'statusId'
  },
});

module.exports = District;